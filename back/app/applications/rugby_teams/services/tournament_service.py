from sqlalchemy.orm import Session

from app.applications.rugby_teams.models.player import Player
from app.applications.rugby_teams.models.tournament import Tournament
from app.applications.rugby_teams.repositories.tournament_repository import TournamentRepository
from app.applications.rugby_teams.schemas.tournament import (
    ApiCreateTournament,
    ApiReturnTournament,
    ApiUpdateTournament,
)
from app.applications.rugby_teams.services.category_service import get_category_by_name
from app.applications.rugby_teams.services.team_service import get_team_by_name
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
    db: Session, team_name: str, skip: int = 0, limit: int = 100
) -> list[Tournament]:
    team = get_team_by_name(db, team_name)
    repo = TournamentRepository(db)
    return repo.get_by_team(team.id, skip, limit)


def create_tournament(
    db: Session,
    team_name: str,
    tournament_in: ApiCreateTournament,
    user_id: int,
) -> ApiReturnTournament:
    team = get_team_by_name(db, team_name)
    if team.user_id != user_id:
        raise ForbiddenError()

    category = get_category_by_name(db, tournament_in.category_name)
    if not category:
        raise CategoryNotFoundError(tournament_in.category_name)

    players = (
        db.query(Player)
        .filter(
            Player.name.in_(tournament_in.player_names),
            Player.team_id == team.id,
        )
        .all()
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
    tournament_in: ApiUpdateTournament,
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

    players = (
        db.query(Player)
        .filter(
            Player.name.in_(tournament_in.player_names),
            Player.team_id == team.id,
        )
        .all()
    )
    if len(players) != len(tournament_in.player_names):
        raise TournamentNotFoundError(0)

    tournament.name = tournament_in.name
    tournament.category_id = category.id
    tournament.players = players
    db.commit()
    db.refresh(tournament)
    return ApiReturnTournament.model_validate(tournament)


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

    db.delete(tournament)
    db.commit()
