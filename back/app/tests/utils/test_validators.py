import pytest
from app.utils.validators import validate_season_format


def test_valid_format():
    assert validate_season_format("2025-2026") is True


def test_valid_format_different_years():
    assert validate_season_format("2024-2025") is True


def test_invalid_format_no_hyphen():
    with pytest.raises(ValueError) as exc:
        validate_season_format("20252026")
    assert "format" in str(exc.value).lower()


def test_invalid_format_wrong_separator():
    with pytest.raises(ValueError):
        validate_season_format("2025/2026")


def test_invalid_format_too_short():
    with pytest.raises(ValueError):
        validate_season_format("25-26")


def test_non_consecutive_years():
    with pytest.raises(ValueError) as exc:
        validate_season_format("2025-2027")
    assert "consécutives" in str(exc.value).lower()


def test_non_consecutive_years_reversed():
    with pytest.raises(ValueError):
        validate_season_format("2025-2024")


def test_same_year():
    with pytest.raises(ValueError):
        validate_season_format("2025-2025")
