import pytest
from pydantic import ValidationError

from app.applications.rugby_teams.schemas.season import ApiReturnSeason, SeasonBase


class TestSeasonBaseValidation:
    def test_season_name_valid(self):
        season = SeasonBase(name="2025-2026")
        assert season.name == "2025-2026"

    def test_season_name_invalid_format(self):
        with pytest.raises(ValidationError):
            SeasonBase(name="20252026")

    def test_season_name_wrong_separator(self):
        with pytest.raises(ValidationError):
            SeasonBase(name="2025/2026")

    def test_season_name_non_consecutive(self):
        with pytest.raises(ValidationError):
            SeasonBase(name="2025-2027")

    def test_season_name_reversed(self):
        with pytest.raises(ValidationError):
            SeasonBase(name="2025-2024")


class TestApiReturnSeason:
    def test_from_attributes(self):
        season = ApiReturnSeason(id=1, name="2025-2026")
        assert season.id == 1
        assert season.name == "2025-2026"
