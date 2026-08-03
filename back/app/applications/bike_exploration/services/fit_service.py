import io
import logging
from datetime import datetime
from typing import NamedTuple

import fitparse

logger = logging.getLogger(__name__)

SEMICIRCLES_TO_DEGREES = 180.0 / 2**31


class GpsPoint(NamedTuple):
    lat: float
    lon: float
    elevation: float | None
    timestamp: datetime | None


def parse_fit_text(content: bytes, filename: str) -> list[GpsPoint]:
    """Parse un fichier FIT binaire et retourne les points GPS (lat, lon, altitude, temps)."""
    fit = fitparse.FitFile(io.BytesIO(content))

    for msg in fit.get_messages("session"):
        sport = msg.get_value("sport")
        if sport is not None:
            sport_str = str(sport).lower()
            if sport_str not in ("cycling", "2"):
                logger.info("Activité ignorée (sport=%s): %s", sport, filename)
                return []

    points = []
    for msg in fit.get_messages("record"):
        lat_raw = msg.get_value("position_lat")
        lon_raw = msg.get_value("position_long")
        if lat_raw is not None and lon_raw is not None:
            lat = lat_raw * SEMICIRCLES_TO_DEGREES
            lon = lon_raw * SEMICIRCLES_TO_DEGREES
            elevation_raw = msg.get_value("altitude")
            points.append(GpsPoint(
                lat=lat,
                lon=lon,
                elevation=float(elevation_raw) if elevation_raw is not None else None,
                timestamp=msg.get_value("timestamp"),
            ))

    logger.info("FIT %s: %d points GPS", filename, len(points))
    return points
