import gzip
import io
import sys
import zipfile
from pathlib import Path
from unittest.mock import MagicMock

import pytest

_root = Path(__file__).resolve().parents[4]
if str(_root) not in sys.path:
    sys.path.insert(0, str(_root))

from app.applications.bike_exploration.models.activity import Activity  # noqa: E402,F401
from app.applications.bike_exploration.models.activity_col import ActivityCol  # noqa: E402,F401
from app.applications.bike_exploration.models.col import Col  # noqa: E402,F401
from app.tests.conftest import *  # noqa: F401,F403,E402


def _make_fitparse_mock(
    sport: str = "cycling",
    records: list[tuple[float, float]] | None = None,
) -> MagicMock:
    """Create a mock fitparse.FitFile returning the given sport and records."""
    mock_fit = MagicMock()

    session_msg = MagicMock()
    session_msg.get_value.return_value = sport

    record_msgs = []
    if records:
        for lat, lon in records:
            msg = MagicMock()

            def make_get_value(lat: float, lon: float) -> object:
                def get_value(field: str) -> float | str | None:
                    if field == "position_lat":
                        return lat
                    elif field == "position_long":
                        return lon
                    return None
                return get_value

            msg.get_value.side_effect = make_get_value(lat, lon)
            record_msgs.append(msg)

    def get_messages(name: str, **kwargs: object) -> list[MagicMock]:
        if name == "session":
            return [session_msg]
        elif name == "record":
            return record_msgs
        return []

    mock_fit.get_messages.side_effect = get_messages
    return mock_fit


def _make_fit_gz() -> bytes:
    """Construit un .fit.gz contenant des données arbitraires (fitparse est mocké)."""
    return gzip.compress(b"mock fit data")


def _make_csv(rows: list[dict[str, str]]) -> bytes:
    """Construit un activities.csv synthétique."""
    header = (
        "ID de l'activité,Date de l'activité,"
        "Nom de l'activité,Type d'activité,"
        "Nom du fichier"
    )
    lines = [header]
    for row in rows:
        lines.append(
            f'{row["id"]},"{row["date"]}","{row["name"]}",'
            f'{row["type"]},"{row["file"]}"'
        )
    return "\n".join(lines).encode("utf-8")


def _make_zip(csv_bytes: bytes, fit_files: dict[str, bytes]) -> bytes:
    """Construit un ZIP contenant un CSV et des fichiers .fit.gz."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("activities.csv", csv_bytes)
        for path, data in fit_files.items():
            zf.writestr(path, data)
    return buf.getvalue()


# Coordonnées proches du Col de la Bonette (44.326, 6.807)
NEAR_COL_RECORDS: list[tuple[float, float]] = [
    (44.3265, 6.8075),
    (44.3268, 6.8078),
    (44.3270, 6.8080),
]

# Points éloignés de tous les cols (~50km)
FAR_FROM_COL_RECORDS: list[tuple[float, float]] = [
    (44.800, 7.500),
    (44.801, 7.501),
]


@pytest.fixture()
def sample_zip_bytes() -> bytes:
    """ZIP synthétique : 2 activités Vélo + 1 Randonnée.

    Les noms de fichiers FIT dans le ZIP sont différents des IDs CSV,
    comme dans un vrai export Strava.
    """
    csv = _make_csv([
        {
            "id": "111111",
            "date": "1 juil. 2026, 10:00:00",
            "name": "Col Bonette",
            "type": "Vélo",
            "file": "activities/999001.fit.gz",
        },
        {
            "id": "222222",
            "date": "2 juil. 2026, 09:00:00",
            "name": "Traverse plateaux",
            "type": "Vélo",
            "file": "activities/999002.fit.gz",
        },
        {
            "id": "333333",
            "date": "3 juil. 2026, 08:00:00",
            "name": "Rando lac",
            "type": "Randonnée",
            "file": "activities/999003.fit.gz",
        },
    ])
    fit_files = {
        "activities/999001.fit.gz": _make_fit_gz(),
        "activities/999002.fit.gz": _make_fit_gz(),
        "activities/999003.fit.gz": _make_fit_gz(),
    }
    return _make_zip(csv, fit_files)
