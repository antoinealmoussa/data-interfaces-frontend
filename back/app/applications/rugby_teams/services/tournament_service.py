from sqlalchemy.orm import Session

from app.applications.rugby_teams.models.tournament import Tournament
from app.applications.rugby_teams.repositories.player_repository import PlayerRepository
from app.applications.rugby_teams.repositories.tournament_repository import TournamentRepository
from app.applications.rugby_teams.schemas.tournament import (
    ApiReturnTournament,
    TournamentBase,
)
from app.applications.rugby_teams.services.category_service import get_category_by_name
from app.applications.rugby_teams.services.team_service import get_owned_team, get_team_by_name
from app.utils.exceptions import (
    CategoryNotFoundError,
    ForbiddenError,
    TournamentNotFoundError,
)


def get_tournament_by_id(
    db: Session, tournament_id: int
) -> Tournament | None:
    repo = TournamentRepository(db)
    return repo.get_by_id(tournament_id)


def get_tournaments_by_team(
    db: Session, team_name: str, user_id: int, skip: int = 0, limit: int = 100
) -> list[Tournament]:
    team = get_owned_team(db, team_name, user_id)
    repo = TournamentRepository(db)
    return repo.get_by_team(team.id, skip, limit)


def create_tournament(
    db: Session,
    team_name: str,
    tournament_in: TournamentBase,
    user_id: int,
) -> ApiReturnTournament:
    team = get_team_by_name(db, team_name)
    if team.user_id != user_id:
        raise ForbiddenError()

    category = get_category_by_name(db, tournament_in.category_name)
    if not category:
        raise CategoryNotFoundError(tournament_in.category_name)

    players = PlayerRepository(db).get_by_names_in_team(
        tournament_in.player_names, team.id
    )
    if len(players) != len(tournament_in.player_names):
        raise TournamentNotFoundError(0)

    repo = TournamentRepository(db)
    return repo.create(
        tournament_in,
        category_id=category.id,
        team_id=team.id,
        players=players,
    )


def update_tournament(
    db: Session,
    tournament_id: int,
    team_name: str,
    tournament_in: TournamentBase,
    user_id: int,
) -> ApiReturnTournament:
    repo = TournamentRepository(db)
    tournament = repo.get_by_id(tournament_id)
    if not tournament:
        raise TournamentNotFoundError(tournament_id)

    team = get_team_by_name(db, team_name)
    if tournament.team_id != team.id:
        raise TournamentNotFoundError(tournament_id)
    if team.user_id != user_id:
        raise ForbiddenError()

    category = get_category_by_name(db, tournament_in.category_name)
    if not category:
        raise CategoryNotFoundError(tournament_in.category_name)

    players = PlayerRepository(db).get_by_names_in_team(
        tournament_in.player_names, team.id
    )
    if len(players) != len(tournament_in.player_names):
        raise TournamentNotFoundError(0)

    return ApiReturnTournament.model_validate(
        repo.update_tournament(tournament, tournament_in.name, category.id, players)
    )


def delete_tournament(
    db: Session, tournament_id: int, team_name: str, user_id: int
) -> None:
    repo = TournamentRepository(db)
    tournament = repo.get_by_id(tournament_id)
    if not tournament:
        raise TournamentNotFoundError(tournament_id)

    team = get_team_by_name(db, team_name)
    if tournament.team_id != team.id:
        raise TournamentNotFoundError(tournament_id)
    if team.user_id != user_id:
        raise ForbiddenError()

    repo.delete_tournament(tournament)
