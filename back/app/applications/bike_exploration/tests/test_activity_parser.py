from unittest.mock import patch

import pytest

from app.applications.bike_exploration.services.activity_parser import parse_zip_archive
from app.applications.bike_exploration.services.fit_service import GpsPoint
from app.applications.bike_exploration.tests.conftest import NEAR_COL_RECORDS

PARSE_FIT_PATH = "app.applications.bike_exploration.services.activity_parser.parse_fit_text"


def _fit_side_effect(content: bytes, filename: str) -> list[GpsPoint]:
    if "999003" in filename:
        return []
    return list(NEAR_COL_RECORDS)


class TestParseZipArchive:
    @patch(PARSE_FIT_PATH, side_effect=_fit_side_effect)
    def test_filters_cycling_only(self, mock_parse_fit: object, sample_zip_bytes: bytes) -> None:
        activities = list(parse_zip_archive(sample_zip_bytes, "export.zip"))
        assert len(activities) == 2
        names = {a.name for a in activities}
        assert "Col Bonette" in names
        assert "Traverse plateaux" in names

    @patch(PARSE_FIT_PATH, side_effect=_fit_side_effect)
    def test_skips_randonnee(self, mock_parse_fit: object, sample_zip_bytes: bytes) -> None:
        activities = list(parse_zip_archive(sample_zip_bytes, "export.zip"))
        names = {a.name for a in activities}
        assert "Rando lac" not in names

    @patch(PARSE_FIT_PATH, side_effect=_fit_side_effect)
    def test_extracts_gps_points(self, mock_parse_fit: object, sample_zip_bytes: bytes) -> None:
        activities = list(parse_zip_archive(sample_zip_bytes, "export.zip"))
        bonette = next(a for a in activities if a.name == "Col Bonette")
        assert len(bonette.gps_points) == 3

    def test_not_a_zip_raises(self) -> None:
        with pytest.raises(ValueError, match="ZIP requis"):
            parse_zip_archive(b"not a zip", "file.txt")

    def test_empty_zip_returns_empty(self) -> None:
        import io
        import zipfile

        buf = io.BytesIO()
        with zipfile.ZipFile(buf, "w") as zf:
            zf.writestr("random.txt", "nothing")
        assert list(parse_zip_archive(buf.getvalue(), "empty.zip")) == []
