from unittest.mock import MagicMock, patch

from app.applications.bike_exploration.services.fit_service import parse_fit_text
from app.applications.bike_exploration.tests.conftest import (
    NEAR_COL_RECORDS,
    _make_fitparse_mock,
)

FITFILE_PATH = "app.applications.bike_exploration.services.fit_service.fitparse.FitFile"


class TestParseFitText:
    @patch(FITFILE_PATH)
    def test_cycling_returns_gps_points(self, mock_fitfile: MagicMock) -> None:
        mock_fitfile.return_value = _make_fitparse_mock("cycling", NEAR_COL_RECORDS)
        points = parse_fit_text(b"mock", "test.fit")
        assert len(points) == 3
        assert all(isinstance(p, tuple) and len(p) == 2 for p in points)

    @patch(FITFILE_PATH)
    def test_cycling_coords_are_floats(self, mock_fitfile: MagicMock) -> None:
        mock_fitfile.return_value = _make_fitparse_mock("cycling", NEAR_COL_RECORDS)
        points = parse_fit_text(b"mock", "test.fit")
        for lat, lon in points:
            assert isinstance(lat, float)
            assert isinstance(lon, float)

    @patch(FITFILE_PATH)
    def test_non_cycling_returns_empty(self, mock_fitfile: MagicMock) -> None:
        mock_fitfile.return_value = _make_fitparse_mock("hiking", NEAR_COL_RECORDS)
        points = parse_fit_text(b"mock", "test.fit")
        assert points == []

    @patch(FITFILE_PATH)
    def test_no_session_returns_empty(self, mock_fitfile: MagicMock) -> None:
        mock_fit = MagicMock()
        mock_fit.get_messages.return_value = []
        mock_fitfile.return_value = mock_fit
        points = parse_fit_text(b"mock", "test.fit")
        assert points == []

    @patch(FITFILE_PATH)
    def test_no_records_returns_empty(self, mock_fitfile: MagicMock) -> None:
        mock_fitfile.return_value = _make_fitparse_mock("cycling")
        points = parse_fit_text(b"mock", "test.fit")
        assert points == []
