import pytest
from pydantic import ValidationError

from app.applications.rugby_teams.schemas.tournament import (
    ApiCreateTournament,
    ApiReturnTournament,
    ApiUpdateTournament,
)


class TestApiCreateTournament:
    def test_valid(self):
        tournament = ApiCreateTournament(
            name="Tournoi test",
            category_name="Mixte",
            player_names=["Jean", "Marie"],
        )
        assert tournament.name == "Tournoi test"
        assert tournament.category_name == "Mixte"
        assert tournament.player_names == ["Jean", "Marie"]

    def test_missing_name(self):
        with pytest.raises(ValidationError):
            ApiCreateTournament(
                category_name="Mixte",
                player_names=["Jean"],
            )

    def test_missing_category(self):
        with pytest.raises(ValidationError):
            ApiCreateTournament(
                name="Tournoi",
                player_names=["Jean"],
            )

    def test_missing_player_names(self):
        with pytest.raises(ValidationError):
            ApiCreateTournament(
                name="Tournoi",
                category_name="Mixte",
            )


class TestApiUpdateTournament:
    def test_valid(self):
        tournament = ApiUpdateTournament(
            name="Tournoi modifié",
            category_name="+35",
            player_names=["Pierre"],
        )
        assert tournament.name == "Tournoi modifié"


class TestApiReturnTournament:
    def test_valid(self):
        tournament = ApiReturnTournament(
            id=1, name="Tournoi", category_name="Mixte", player_names=["Jean"]
        )
        assert tournament.id == 1
        assert tournament.name == "Tournoi"
        assert tournament.category_name == "Mixte"
        assert tournament.player_names == ["Jean"]
