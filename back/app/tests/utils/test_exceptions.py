from app.utils.exceptions import (
    CategoryNotFoundError,
    ForbiddenError,
    PlayerNotFoundError,
    TeamNotFoundError,
    TournamentNotFoundError,
)


class TestTeamNotFoundError:
    def test_message(self):
        error = TeamNotFoundError("Mon équipe")
        assert "Mon équipe" in str(error)
        assert error.team_name == "Mon équipe"


class TestPlayerNotFoundError:
    def test_message(self):
        error = PlayerNotFoundError(42)
        assert "42" in str(error)
        assert error.player_id == 42


class TestTournamentNotFoundError:
    def test_message(self):
        error = TournamentNotFoundError(99)
        assert "99" in str(error)
        assert error.tournament_id == 99

    def test_zero_id(self):
        error = TournamentNotFoundError(0)
        assert "0" in str(error)


class TestCategoryNotFoundError:
    def test_message(self):
        error = CategoryNotFoundError("Mixte")
        assert "Mixte" in str(error)
        assert error.category_name == "Mixte"


class TestForbiddenError:
    def test_default_message(self):
        error = ForbiddenError()
        assert str(error) == "Non autorisé"

    def test_custom_message(self):
        error = ForbiddenError("Accès refusé")
        assert str(error) == "Accès refusé"
