#!/usr/bin/env python3
"""Fill missing elevation data from Open-Elevation API.

Reads ``cols.csv``, batches rows with empty ``ele``, queries
`Open-Elevation API <https://api.open-elevation.com/>`_ with
their lat/lon, and writes the result to ``cols_enriched.csv``.

Usage:
    python -m app.applications.bike_exploration.data.enrich_elevation
    python -m app.applications.bike_exploration.data.enrich_elevation \\
        --input path/to/cols.csv --output path/to/cols_enriched.csv
"""

from __future__ import annotations

import argparse
import csv
import sys
import time
from pathlib import Path

import httpx

DATA_DIR = Path(__file__).parent
INPUT_CSV = DATA_DIR / "raw" / "cols.csv"
OUTPUT_CSV = DATA_DIR / "raw" / "cols_enriched.csv"

FIELDNAMES = ["osm_id", "name", "latitude", "longitude", "ele", "country"]
OPEN_ELEVATION_URL = "https://api.opentopodata.org/v1/eudem25m"
BATCH_SIZE = 30
REQUEST_DELAY = 1.0


def _round_ele(ele: float | None) -> int | str:
    if ele is None:
        return ""
    return round(ele)


def fill_elevation(
    input_path: Path,
    output_path: Path,
    batch_size: int = BATCH_SIZE,
    delay: float = REQUEST_DELAY,
) -> int:
    rows: list[dict[str, str]] = []
    missing_indices: list[int] = []

    with input_path.open(newline="") as f:
        reader = csv.DictReader(f, fieldnames=FIELDNAMES)
        next(reader)
        for i, row in enumerate(reader):
            rows.append(row)
            if not row["ele"]:
                missing_indices.append(i)

    if not missing_indices:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        _write_csv(output_path, rows)
        print(f"✓ already filled — copied {len(rows)} rows to {output_path}", file=sys.stderr)
        return 0

    total = len(missing_indices)
    print(
        f"Filling {total} missing elevations via Open-Elevation API …",
        file=sys.stderr,
    )

    with httpx.Client() as client:
        for start in range(0, total, batch_size):
            batch = missing_indices[start : start + batch_size]
            locations = "|".join(
                f"{rows[i]['latitude']},{rows[i]['longitude']}"
                for i in batch
            )

            try:
                resp = client.get(
                    OPEN_ELEVATION_URL,
                    params={"locations": locations},
                    headers={
                        "Accept": "application/json",
                        "User-Agent": "Stravoska/1.0",
                    },
                    timeout=30.0,
                )
                resp.raise_for_status()
                results = resp.json()["results"]

                for idx, result in zip(batch, results):
                    rows[idx]["ele"] = str(_round_ele(result["elevation"]))

                done = min(start + batch_size, total)
                print(f"  [{done}/{total}] ✓", file=sys.stderr)

            except (httpx.HTTPError, httpx.TimeoutException, KeyError) as e:
                print(
                    f"  [{start + len(batch)}/{total}] ✗ {e}",
                    file=sys.stderr,
                )
                for i in batch:
                    if rows[i]["ele"] == "":
                        rows[i]["ele"] = ""
                continue

            time.sleep(delay)

    enriched = sum(1 for r in rows if r["ele"] != "")
    print(
        f"  Done — {enriched}/{len(rows)} rows have elevation",
        file=sys.stderr,
    )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    _write_csv(output_path, rows)
    print(f"✓ {len(rows)} rows → {output_path}", file=sys.stderr)
    return 0


def _write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    with path.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fill missing elevation from Open-Elevation API",
    )
    parser.add_argument(
        "--input",
        "-i",
        type=Path,
        default=INPUT_CSV,
        help="Input CSV path (default: raw/cols.csv)",
    )
    parser.add_argument(
        "--output",
        "-o",
        type=Path,
        default=OUTPUT_CSV,
        help="Output CSV path (default: raw/cols_enriched.csv)",
    )
    parser.add_argument(
        "--batch-size",
        "-b",
        type=int,
        default=BATCH_SIZE,
        help=f"API batch size (default: {BATCH_SIZE})",
    )
    parser.add_argument(
        "--delay",
        "-d",
        type=float,
        default=REQUEST_DELAY,
        help=f"Delay between requests in seconds (default: {REQUEST_DELAY})",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    return fill_elevation(args.input, args.output, args.batch_size, args.delay)


if __name__ == "__main__":
    from app.core.logging_config import setup_logging
    setup_logging()
    sys.exit(main())
