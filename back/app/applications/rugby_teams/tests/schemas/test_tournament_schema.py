import pytest
from pydantic import ValidationError

from app.applications.rugby_teams.schemas.tournament import (
    ApiReturnTournament,
    TournamentBase,
)


class TestTournamentBase:
    def test_valid(self):
        tournament = TournamentBase(
            name="Tournoi test",
            category_name="Mixte",
            player_names=["Jean", "Marie"],
        )
        assert tournament.name == "Tournoi test"
        assert tournament.category_name == "Mixte"
        assert tournament.player_names == ["Jean", "Marie"]

    def test_missing_name(self):
        with pytest.raises(ValidationError):
            TournamentBase(
                category_name="Mixte",
                player_names=["Jean"],
            )

    def test_missing_category(self):
        with pytest.raises(ValidationError):
            TournamentBase(
                name="Tournoi",
                player_names=["Jean"],
            )

    def test_missing_player_names(self):
        with pytest.raises(ValidationError):
            TournamentBase(
                name="Tournoi",
                category_name="Mixte",
            )

    def test_update_variant_valid(self):
        tournament = TournamentBase(
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
