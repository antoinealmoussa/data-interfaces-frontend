import pytest
from pydantic import ValidationError

from app.schemas.team import ApiCreateTeam


class TestTeamBaseValidators:
    def test_team_name_valid(self):
        team = ApiCreateTeam(
            name="Mon équipe",
            categories=["Mixte"],
            user_id=1,
            season_name="2025-2026",
        )
        assert team.name == "Mon équipe"

    def test_team_name_too_long(self):
        with pytest.raises(ValidationError) as exc:
            ApiCreateTeam(
                name="A" * 51,
                categories=["Mixte"],
                user_id=1,
                season_name="2025-2026",
            )
        assert "50 caractères" in str(exc.value)

    def test_team_name_empty(self):
        with pytest.raises(ValidationError) as exc:
            ApiCreateTeam(
                name="",
                categories=["Mixte"],
                user_id=1,
                season_name="2025-2026",
            )
        assert "obligatoire" in str(exc.value) or "nom" in str(exc.value).lower()

    def test_team_name_whitespace_only(self):
        with pytest.raises(ValidationError):
            ApiCreateTeam(
                name="   ",
                categories=["Mixte"],
                user_id=1,
                season_name="2025-2026",
            )


class TestCategoriesValidator:
    def test_categories_valid(self):
        team = ApiCreateTeam(
            name="Mon équipe",
            categories=["Mixte", "+35", "Open masculin"],
            user_id=1,
            season_name="2025-2026",
        )
        assert len(team.categories) == 3

    def test_categories_empty(self):
        with pytest.raises(ValidationError) as exc:
            ApiCreateTeam(
                name="Mon équipe",
                categories=[],
                user_id=1,
                season_name="2025-2026",
            )
        assert "au moins une catégorie" in str(exc.value).lower()

    def test_categories_none(self):
        with pytest.raises(ValidationError):
            ApiCreateTeam(
                name="Mon équipe",
                categories=None,
                user_id=1,
                season_name="2025-2026",
            )

    def test_categories_invalid_value(self):
        with pytest.raises(ValidationError) as exc:
            ApiCreateTeam(
                name="Mon équipe",
                categories=["InvalidCategory"],
                user_id=1,
                season_name="2025-2026",
            )
        assert "invalide" in str(exc.value).lower()

    def test_categories_mixed_case(self):
        with pytest.raises(ValidationError):
            ApiCreateTeam(
                name="Mon équipe",
                categories=["mixte"],
                user_id=1,
                season_name="2025-2026",
            )


class TestSeasonNameValidator:
    def test_season_name_valid(self):
        team = ApiCreateTeam(
            name="Mon équipe",
            categories=["Mixte"],
            user_id=1,
            season_name="2025-2026",
        )
        assert team.season_name == "2025-2026"

    def test_season_name_empty(self):
        with pytest.raises(ValidationError) as exc:
            ApiCreateTeam(
                name="Mon équipe",
                categories=["Mixte"],
                user_id=1,
                season_name="",
            )
        assert "saison" in str(exc.value).lower()

    def test_season_name_invalid_format(self):
        with pytest.raises(ValidationError):
            ApiCreateTeam(
                name="Mon équipe",
                categories=["Mixte"],
                user_id=1,
                season_name="2025-2027",
            )

    def test_season_name_non_consecutive(self):
        with pytest.raises(ValidationError):
            ApiCreateTeam(
                name="Mon équipe",
                categories=["Mixte"],
                user_id=1,
                season_name="2025-2027",
            )
