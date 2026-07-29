#!/usr/bin/env python3
"""Aggregate per-cell col files into a single CSV.

Reads all JSON files from ``raw/cells/``, deduplicates by OSM node ID,
sorts by descending elevation, and writes a flat CSV.

Usage:
    python -m app.applications.bike_exploration.data.aggregate_cols

    # With semicolon separator for French Excel
    python -m app.applications.bike_exploration.data.aggregate_cols --delimiter ";"
"""

from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path
from typing import Any, Iterator

DATA_DIR = Path(__file__).parent
CELLS_DIR = DATA_DIR / "raw" / "cells"

FIELDNAMES = ["osm_id", "name", "latitude", "longitude", "ele", "country"]


def iter_cols() -> Iterator[dict[str, Any]]:
    seen: set[int] = set()
    for cell_file in sorted(CELLS_DIR.glob("*.json")):
        data = json.loads(cell_file.read_text())
        for col in data.get("cols", []):
            osm_id = col["id"]
            if osm_id in seen:
                continue
            seen.add(osm_id)
            yield {
                "osm_id": osm_id,
                "name": col.get("name") or "",
                "latitude": col["lat"],
                "longitude": col["lon"],
                "ele": col["ele"] if col["ele"] is not None else "",
                "country": col["country"],
            }


def _ele_sort_key(row: dict[str, Any]) -> tuple[int, int]:
    ele = row["ele"]
    if ele == "":
        return (1, 0)
    return (0, -ele)


def aggregate(
    output_path: Path,
    delimiter: str = ",",
) -> int:
    cells_dir = CELLS_DIR
    if not cells_dir.is_dir():
        print(
            f"error: cell directory not found: {cells_dir}",
            file=sys.stderr,
        )
        return 1

    cell_files = sorted(cells_dir.glob("*.json"))
    if not cell_files:
        print(f"error: no cell files found in {cells_dir}", file=sys.stderr)
        return 1

    output_path.parent.mkdir(parents=True, exist_ok=True)

    rows = sorted(iter_cols(), key=_ele_sort_key)
    with output_path.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES, delimiter=delimiter)
        writer.writeheader()
        writer.writerows(rows)

    print(f"✓ {len(rows)} cols → {output_path}", file=sys.stderr)
    return 0


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Aggregate per-cell col files into a single CSV",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=DATA_DIR / "raw" / "cols.csv",
        help="Output CSV path (default: raw/cols.csv relative to data dir)",
    )
    parser.add_argument(
        "--delimiter",
        "-d",
        type=str,
        default=",",
        help="CSV delimiter (default: comma)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    return aggregate(args.output, args.delimiter)


if __name__ == "__main__":
    from app.core.logging_config import setup_logging
    setup_logging()
    sys.exit(main())
