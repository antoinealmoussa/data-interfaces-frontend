import math
from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.applications.bike_exploration.models.activity import Activity
from app.applications.bike_exploration.models.col import Col
from app.applications.bike_exploration.repositories.activity_col_repository import (
    ActivityColRepository,
)
from app.applications.bike_exploration.repositories.col_repository import ColRepository
from app.applications.bike_exploration.services.fit_service import GpsPoint

IN_THRESHOLD_M = 200.0
OUT_THRESHOLD_M = 400.0
ELEVATION_RATIO = 0.95
ELEVATION_MIN_TOLERANCE_M = 40.0
MIN_CROSSING_INTERVAL = timedelta(hours=1)
GRID_STEP = 0.01
BBOX_MARGIN = 0.005


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6_371_000
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _grid_key(lat: float, lng: float) -> str:
    return f"{round(lat / GRID_STEP)}_{round(lng / GRID_STEP)}"


def _build_grid(cols: list) -> dict[str, list]:
    grid: dict[str, list] = defaultdict(list)
    for col in cols:
        key = _grid_key(col.latitude, col.longitude)
        grid[key].append(col)
    return grid


def _nearby_keys(lat: float, lng: float) -> list[str]:
    base_rlat = round(lat / GRID_STEP)
    base_rlng = round(lng / GRID_STEP)
    return [
        f"{base_rlat + di}_{base_rlng + dj}"
        for di in (-1, 0, 1)
        for dj in (-1, 0, 1)
    ]


def _elevation_ok(max_ele: float | None, col_ele: float | None) -> bool:
    """L'élévation enregistrée doit être très proche de l'altitude du col.

    Tolérance = max(3% de l'altitude du col, 40m) : la marge absolue ne
    descend jamais sous 40m pour les petits cols (erreur GPS ±20-40m).
    """
    if max_ele is None or col_ele is None:
        return True
    tolerance = max(col_ele * (1 - ELEVATION_RATIO), ELEVATION_MIN_TOLERANCE_M)
    return max_ele >= col_ele - tolerance


def count_col_crossings(
    points: list[GpsPoint],
    grid: dict[str, list[Col]],
) -> dict[int, int]:
    """Compte les traversées de cols via une machine d'état OUT/IN.

    Un crossing n'est validé qu'à la sortie de zone (IN → OUT) et seulement si :
      - l'élévation maximale dans la zone atteint ~97% de l'altitude du col,
      - la dernière traversée acceptée date d'au moins 1h (pas de re-montée
        immédiate possible).
    """
    active: dict[int, bool] = {}
    entry_time: dict[int, datetime] = {}
    max_ele: dict[int, float] = {}
    crossings: dict[int, int] = {}
    last_crossing_at: dict[int, datetime] = {}
    cols_by_id: dict[int, Col] = {c.id: c for cols in grid.values() for c in cols}

    for point in points:
        matched_now: dict[int, Col] = {}
        for key in _nearby_keys(point.lat, point.lon):
            for col in grid.get(key, []):
                if haversine(col.latitude, col.longitude, point.lat, point.lon) < OUT_THRESHOLD_M:
                    matched_now[col.id] = col

        for col_id, col in matched_now.items():
            if active.get(col_id):
                if point.elevation is not None:
                    max_ele[col_id] = max(max_ele.get(col_id, point.elevation), point.elevation)
                continue

            distance = haversine(col.latitude, col.longitude, point.lat, point.lon)
            if distance >= IN_THRESHOLD_M:
                continue

            active[col_id] = True
            entry_time[col_id] = point.timestamp
            if point.elevation is not None:
                max_ele[col_id] = point.elevation

        for col_id in list(active):
            if col_id not in matched_now:
                active[col_id] = False

                col = cols_by_id.get(col_id)
                if col is None or not _crossing_qualified(
                    col, entry_time.get(col_id), max_ele.get(col_id),
                    last_crossing_at.get(col_id),
                ):
                    continue

                crossings[col_id] = crossings.get(col_id, 0) + 1
                last_crossing_at[col_id] = entry_time[col_id]

    for col_id in list(active):
        if not active.get(col_id):
            continue
        col = cols_by_id.get(col_id)
        if col is not None and _crossing_qualified(
            col, entry_time.get(col_id), max_ele.get(col_id),
            last_crossing_at.get(col_id),
        ):
            crossings[col_id] = crossings.get(col_id, 0) + 1
            last_crossing_at[col_id] = entry_time[col_id]

    return crossings


def _crossing_qualified(
    col: Col,
    entry_time: datetime | None,
    max_ele: float | None,
    last_crossing_at: datetime | None,
) -> bool:
    """Critères de qualification : altitude proche du sommet ET délai > 1h."""
    if not _elevation_ok(max_ele, col.elevation):
        return False
    if entry_time is not None and last_crossing_at is not None:
        if entry_time - last_crossing_at < MIN_CROSSING_INTERVAL:
            return False
    return True


def match_activity_cols(
    db: Session, activity: Activity, points: list[GpsPoint]
) -> None:
    if not points:
        return

    lats = [p.lat for p in points]
    lons = [p.lon for p in points]
    min_lat, max_lat = min(lats) - BBOX_MARGIN, max(lats) + BBOX_MARGIN
    min_lon, max_lon = min(lons) - BBOX_MARGIN, max(lons) + BBOX_MARGIN

    col_repo = ColRepository(db)
    nearby_cols = col_repo.get_within_bbox(min_lat, max_lat, min_lon, max_lon)

    grid = _build_grid(nearby_cols)

    crossings = count_col_crossings(points, grid)

    act_col_repo = ActivityColRepository(db)
    act_col_repo.link_cols(activity.id, crossings)
