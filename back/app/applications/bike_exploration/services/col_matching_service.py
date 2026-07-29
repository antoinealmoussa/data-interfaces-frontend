import math
from collections import defaultdict

from sqlalchemy.orm import Session

from app.applications.bike_exploration.models.activity import Activity
from app.applications.bike_exploration.models.col import Col
from app.applications.bike_exploration.repositories.activity_col_repository import (
    ActivityColRepository,
)
from app.applications.bike_exploration.repositories.col_repository import ColRepository

DISTANCE_THRESHOLD_M = 200.0
GRID_STEP = 0.01
BBOX_MARGIN = 0.005  # ~500m, couvre le seuil de 200m


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


def match_activity_cols(
    db: Session, activity: Activity, points: list[tuple[float, float]]
) -> None:
    if not points:
        return

    matched_cols = match_cols_for_points(db, points)

    col_repo = ActivityColRepository(db)
    col_repo.link_cols(activity.id, [c.id for c in matched_cols])


def match_cols_for_points(
    db: Session,
    points: list[tuple[float, float]],
) -> list[Col]:
    """Retourne les cols proches des points GPS donnés.

    Requête uniquement les cols dans la bounding box des points + marge,
    puis applique grid + haversine pour le matching fin.
    """
    if not points:
        return []

    lats = [p[0] for p in points]
    lons = [p[1] for p in points]
    min_lat, max_lat = min(lats) - BBOX_MARGIN, max(lats) + BBOX_MARGIN
    min_lon, max_lon = min(lons) - BBOX_MARGIN, max(lons) + BBOX_MARGIN

    col_repo = ColRepository(db)
    nearby_cols = col_repo.get_within_bbox(min_lat, max_lat, min_lon, max_lon)

    grid = _build_grid(nearby_cols)

    matched: dict[int, Col] = {}
    for lat, lon in points:
        for key in _nearby_keys(lat, lon):
            for col in grid.get(key, []):
                if col.id not in matched:
                    if haversine(col.latitude, col.longitude, lat, lon) < DISTANCE_THRESHOLD_M:
                        matched[col.id] = col

    return list(matched.values())
