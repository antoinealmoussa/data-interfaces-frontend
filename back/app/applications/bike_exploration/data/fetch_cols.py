#!/usr/bin/env python3
"""Harvest mountain pass (col) data from OpenStreetMap via Overpass API.

Countries are derived from the polygons in ``boundaries.geojson``. Each is
split into a grid of cells, then ``node["mountain_pass"="yes"]`` and
``way["highway"~"primary|secondary|tertiary"]`` are fetched and
cross-referenced to find road-accessible passes. Country is assigned per
node via point-in-polygon (shapely).

Each cell is written to its own JSON file in ``raw/cells/`` with an atomic
write (tmp + rename), enabling safe resume: if a cell file already exists
on a subsequent run it is skipped.

Usage:
    # Full harvest over all countries in boundaries.geojson
    python -m app.applications.bike_exploration.data.fetch_cols \\
        --output data/raw/cols.json --grid 1.0

    # Test on a restricted area (e.g. Isère department)
    python -m app.applications.bike_exploration.data.fetch_cols \\
        --bbox 44.7 4.7 45.7 6.3 --bbox-name isere \\
        --grid 0.5 --output data/raw/cols_isere.json
"""

from __future__ import annotations

import argparse
import json
import random
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx
from shapely.geometry import Point, shape

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
REQUEST_TIMEOUT = 60.0
BASE_BACKOFF = 5.0
BOUNDARIES_PATH = Path(__file__).parent / "boundaries.geojson"
CELLS_DIR = Path(__file__).parent / "raw" / "cells"


def cell_filename(cell: dict[str, Any]) -> str:
    """Deterministic filename for a cell's output."""
    south, west, north, east = cell["bbox"]
    return f"{cell['country']}_{south:.1f}_{west:.1f}_{north:.1f}_{east:.1f}.json"


def generate_cells(
    grid_size: float,
    country_bboxes: dict[str, tuple[float, float, float, float]] | None = None,
    bbox: tuple[float, float, float, float] | None = None,
    bbox_name: str = "test",
) -> list[dict[str, Any]]:
    """Split each country into grid_size × grid_size bounding boxes."""
    cells: list[dict[str, Any]] = []

    areas: list[tuple[str, float, float, float, float]] = (
        [(bbox_name, *bbox)] if bbox
        else [(c, *coords) for c, coords in (country_bboxes or {}).items()]
    )

    for name, min_lat, min_lon, max_lat, max_lon in areas:
        lat = min_lat
        while lat < max_lat:
            n_lat = min(lat + grid_size, max_lat)
            lon = min_lon
            while lon < max_lon:
                n_lon = min(lon + grid_size, max_lon)
                cells.append({
                    "country": name,
                    "bbox": (lat, lon, n_lat, n_lon),
                    "attempts": 0,
                })
                lon = n_lon
            lat = n_lat
    return cells


def build_query(south: float, west: float, north: float, east: float) -> str:
    """Build Overpass QL for mountain passes + roads in a bounding box."""
    return (
        f"[out:json][timeout:{int(REQUEST_TIMEOUT)}][maxsize:536870912];\n"
        "(\n"
        f'  node["mountain_pass"="yes"]({south},{west},{north},{east});\n'
        f'  way["highway"~"primary|secondary|tertiary"]'
        f"({south},{west},{north},{east});\n"
        ");\n"
        "out center;\n"
    )


def fetch_cell(
    client: httpx.Client,
    query: str,
    max_retries: int = 5,
) -> dict[str, Any] | None:
    """POST an Overpass query with exponential-backoff retry."""
    for attempt in range(max_retries):
        try:
            resp = client.post(
                OVERPASS_URL,
                data={"data": query},
                headers={
                    "Accept": "*/*",
                    "User-Agent": "Stravoska/1.0",
                },
                timeout=REQUEST_TIMEOUT,
            )

            if resp.status_code == 429:
                _backoff(attempt, max_retries, "429 Too Many Requests")
                continue
            if resp.status_code == 504:
                _backoff(attempt, max_retries, "504 Gateway Timeout")
                continue

            resp.raise_for_status()
            return resp.json()

        except httpx.TimeoutException:
            _backoff(attempt, max_retries, "timeout")

        except httpx.HTTPStatusError as e:
            if e.response.status_code in (429, 504):
                continue
            body = e.response.text[:300]
            print(
                f"    ✗ HTTP {e.response.status_code}: {body}",
                file=sys.stderr,
            )
            return None

    return None


def _backoff(attempt: int, max_retries: int, reason: str) -> None:
    delay = BASE_BACKOFF * (2.0 ** attempt) + random.uniform(0, 2.0)
    print(
        f"  ⚠ {reason} — retry in {delay:.0f}s "
        f"(attempt {attempt + 1}/{max_retries})",
        file=sys.stderr,
    )
    time.sleep(delay)


def _write_cell_file(cell_file: Path, data: dict[str, Any]) -> None:
    """Atomic write via tmp + rename."""
    cell_file.parent.mkdir(parents=True, exist_ok=True)
    tmp = cell_file.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    tmp.rename(cell_file)


def process_all_cells(
    cells: list[dict[str, Any]],
    max_retries: int = 5,
    request_delay: float = 2.0,
    boundaries_path: Path = BOUNDARIES_PATH,
) -> dict[str, Any]:
    """Fetch every cell, write results per cell, aggregate metadata.

    Already-existing cell files are skipped for safe resume.
    Returns an aggregated metadata dict.
    """
    boundaries = load_boundaries(boundaries_path)
    total = len(cells)
    queue = list(cells)
    skipped = 0
    completed = 0
    failed = 0

    CELLS_DIR.mkdir(parents=True, exist_ok=True)

    with httpx.Client() as client:
        while queue:
            cell = queue.pop(0)
            south, west, north, east = cell["bbox"]
            label = (
                f"{cell['country']} "
                f"[{south:.1f},{west:.1f}→{north:.1f},{east:.1f}]"
            )

            cell_file = CELLS_DIR / cell_filename(cell)
            if cell_file.exists():
                skipped += 1
                print(
                    f"  [{completed + failed + skipped}/{total}] {label}… "
                    f"↻ skipped (exists)",
                    file=sys.stderr,
                )
                continue

            print(
                f"  [{completed + failed + skipped}/{total}] {label}…",
                file=sys.stderr,
            )

            query = build_query(south, west, north, east)
            result = fetch_cell(client, query, max_retries)

            if result is None:
                cell["attempts"] += 1
                if cell["attempts"] < max_retries:
                    queue.append(cell)
                    print(
                        f"    ↻ re-queued (att. {cell['attempts']}/{max_retries})",
                        file=sys.stderr,
                    )
                else:
                    failed += 1
                    print(
                        f"    ✗ failed after {max_retries} attempts",
                        file=sys.stderr,
                    )
            else:
                elements = result.get("elements", [])
                cell_nodes: dict[int, dict[str, Any]] = {}
                cell_way_ids: set[int] = set()
                for el in elements:
                    if el["type"] == "node":
                        cell_nodes[el["id"]] = _normalize_node(el)
                    elif el["type"] == "way":
                        cell_way_ids.update(el.get("nodes", []))

                resolve_countries(cell_nodes, boundaries)

                road_cols = [
                    _build_col_output(cell_nodes[nid])
                    for nid in sorted(cell_nodes)
                    if nid in cell_way_ids
                    and cell_nodes[nid]["country"] is not None
                ]

                unresolved = sum(
                    1 for n in cell_nodes.values() if n["country"] is None
                )
                if unresolved:
                    print(
                        f"    ⚠ {unresolved} nodes without country",
                        file=sys.stderr,
                    )

                cell_data = {
                    "cell": {
                        "country": cell["country"],
                        "bbox": cell["bbox"],
                    },
                    "cols": road_cols,
                    "metadata": {
                        "total_nodes": len(cell_nodes),
                        "unresolved_nodes": unresolved,
                        "road_accessible_passes": len(road_cols),
                    },
                }

                _write_cell_file(cell_file, cell_data)

                completed += 1
                print(
                    f"    ✓ {len(elements)} elements, {len(road_cols)} cols "
                    f"→ {cell_file.name}",
                    file=sys.stderr,
                )

            time.sleep(request_delay)

    total_nodes = 0
    total_cols = 0
    for cell_file in sorted(CELLS_DIR.glob("*.json")):
        data = json.loads(cell_file.read_text())
        total_nodes += data["metadata"]["total_nodes"]
        total_cols += data["metadata"]["road_accessible_passes"]

    metadata: dict[str, Any] = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "countries": list(boundaries.keys()),
        "total_cells": total,
        "skipped_cells": skipped,
        "completed_cells": completed,
        "failed_cells": failed,
        "cell_files_on_disk": len(list(CELLS_DIR.glob("*.json"))),
        "total_mountain_pass_nodes": total_nodes,
        "road_accessible_passes": total_cols,
    }

    print(
        f"\n  Metadata: total={total}, skipped={skipped}, "
        f"completed={completed}, failed={failed}",
        file=sys.stderr,
    )
    print(
        f"  Nodes on disk: {total_nodes}, cols: {total_cols}",
        file=sys.stderr,
    )

    return metadata


def _normalize_node(el: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": el["id"],
        "lat": el["lat"],
        "lon": el["lon"],
        "tags": el.get("tags", {}),
        "country": None,
    }


def _build_col_output(node: dict[str, Any]) -> dict[str, Any]:
    tags = node["tags"]
    return {
        "id": node["id"],
        "name": tags.get("name"),
        "lat": node["lat"],
        "lon": node["lon"],
        "ele": _parse_ele(tags.get("ele")),
        "country": node["country"],
        "tags": tags,
    }


def _parse_ele(ele: str | None) -> int | None:
    if ele is None:
        return None
    try:
        return int(float(ele))
    except (ValueError, TypeError):
        return None


def load_boundaries(path: Path = BOUNDARIES_PATH) -> dict[str, Any]:
    """Load country boundaries from GeoJSON, return {country: shapely geometry}."""
    with open(path) as f:
        data = json.load(f)
    return {
        feat["properties"]["country"]: shape(feat["geometry"])
        for feat in data["features"]
    }


def resolve_countries(
    nodes: dict[int, dict[str, Any]],
    boundaries: dict[str, Any],
) -> int:
    """Assign country to each node via point-in-polygon. Returns count of unresolved."""
    unresolved = 0
    for node in nodes.values():
        pt = Point(node["lon"], node["lat"])
        node["country"] = None
        for country, polygon in boundaries.items():
            if polygon.contains(pt):
                node["country"] = country
                break
        if node["country"] is None:
            unresolved += 1
    return unresolved


def get_country_bboxes(
    boundaries: dict[str, Any],
) -> dict[str, tuple[float, float, float, float]]:
    """Extract (min_lat, min_lon, max_lat, max_lon) from each country polygon."""
    return {
        country: (geom.bounds[1], geom.bounds[0], geom.bounds[3], geom.bounds[2])
        for country, geom in boundaries.items()
    }


def save_results(
    metadata: dict[str, Any],
    output_path: Path,
) -> None:
    """Write the aggregated metadata as a pretty-printed JSON file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    data = {"metadata": metadata}
    tmp = output_path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    tmp.rename(output_path)
    print(f"\n✓ Metadata → {output_path}", file=sys.stderr)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Harvest mountain pass data from OpenStreetMap via Overpass API",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=Path("app/applications/bike_exploration/data/raw/cols.json"),
        help="Output JSON path for metadata (default: data/raw/cols.json)",
    )
    parser.add_argument(
        "--grid",
        "-g",
        type=float,
        default=1.0,
        help="Grid cell size in degrees (default: 1.0)",
    )
    parser.add_argument(
        "--retries",
        "-r",
        type=int,
        default=5,
        help="Max retries per cell (default: 5)",
    )
    parser.add_argument(
        "--delay",
        "-d",
        type=float,
        default=2.0,
        help="Delay between requests in seconds (default: 2.0)",
    )
    parser.add_argument(
        "--boundaries",
        "-b",
        type=Path,
        default=BOUNDARIES_PATH,
        help="Boundaries GeoJSON path (default: boundaries.geojson)",
    )
    parser.add_argument(
        "--bbox",
        type=float,
        nargs=4,
        metavar=("MIN_LAT", "MIN_LON", "MAX_LAT", "MAX_LON"),
        default=None,
        help="Restrict to a single bounding box (min_lat min_lon max_lat max_lon)",
    )
    parser.add_argument(
        "--bbox-name",
        type=str,
        default="test",
        help="Label for the bounding box (default: test)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    """Entry point. Returns 0 if all cells succeeded, 1 if any failed."""
    args = parse_args(argv)

    print("Loading boundaries…", file=sys.stderr)
    boundaries = load_boundaries(args.boundaries)
    country_bboxes = get_country_bboxes(boundaries)

    print("Generating grid cells…", file=sys.stderr)
    if args.bbox:
        bbox = tuple(args.bbox)
        cells = generate_cells(args.grid, bbox=bbox, bbox_name=args.bbox_name)
        print(
            f"  {len(cells)} cells over {args.bbox_name} "
            f"[{bbox[0]},{bbox[1]}→{bbox[2]},{bbox[3]}]",
            file=sys.stderr,
        )
    else:
        cells = generate_cells(args.grid, country_bboxes=country_bboxes)
        print(
            f"  {len(cells)} cells across {len(country_bboxes)} countries",
            file=sys.stderr,
        )

    print("Fetching Overpass data…", file=sys.stderr)
    metadata = process_all_cells(
        cells, args.retries, args.delay, args.boundaries,
    )

    print(file=sys.stderr)
    print(
        f"  Nodes (mountain_pass=yes):    {metadata['total_mountain_pass_nodes']}",
        file=sys.stderr,
    )
    print(
        f"  Road-accessible passes:       {metadata['road_accessible_passes']}",
        file=sys.stderr,
    )
    print(
        f"  Cells completed/skipped:      "
        f"{metadata['completed_cells']}/{metadata['skipped_cells']}",
        file=sys.stderr,
    )
    print(f"  Cells failed:                 {metadata['failed_cells']}", file=sys.stderr)

    save_results(metadata, args.output)

    return 0 if metadata["failed_cells"] == 0 else 1


if __name__ == "__main__":
    from app.core.logging_config import setup_logging
    setup_logging()
    sys.exit(main())
