from app.applications.rugby_teams.repositories.player_repository import (
    PlayerRepository,
)
from app.applications.rugby_teams.repositories.team_repository import TeamRepository
from app.applications.rugby_teams.repositories.tournament_repository import (
    TournamentRepository,
)
from app.db import repositories


def test_repositories_reexports():
    assert repositories.__all__ == [
        "PlayerRepository",
        "TeamRepository",
        "TournamentRepository",
    ]


def test_reexported_repositories_match_sources():
    assert repositories.PlayerRepository is PlayerRepository
    assert repositories.TeamRepository is TeamRepository
    assert repositories.TournamentRepository is TournamentRepository
