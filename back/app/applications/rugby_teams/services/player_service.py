from sqlalchemy.orm import Session

from app.applications.rugby_teams.models.player import Player
from app.applications.rugby_teams.repositories.player_repository import PlayerRepository
from app.applications.rugby_teams.schemas.player import ApiReturnPlayer, PlayerBase
from app.applications.rugby_teams.services.category_service import resolve_categories
from app.applications.rugby_teams.services.team_service import get_owned_team, get_team_by_name
from app.utils.exceptions import ForbiddenError, PlayerNotFoundError


def get_player_by_id(db: Session, player_id: int) -> Player | None:
    repo = PlayerRepository(db)
    return repo.get_by_id(player_id)


def get_players_by_team(
    db: Session, team_name: str, user_id: int, skip: int = 0, limit: int = 100
):
    team = get_owned_team(db, team_name, user_id)
    repo = PlayerRepository(db)
    return repo.get_by_team(team.id, skip, limit)


def create_player(
    db: Session, team_name: str, player_in: PlayerBase, user_id: int
) -> ApiReturnPlayer:
    team = get_team_by_name(db, team_name)
    if team.user_id != user_id:
        raise ForbiddenError()

    try:
        categories = resolve_categories(db, player_in.category_names)
    except ValueError:
        raise PlayerNotFoundError(0)

    repo = PlayerRepository(db)
    return repo.create(player_in, team_id=team.id, categories=categories)


def update_player(
    db: Session, player_id: int, team_name: str, user_id: int,
    player_in: PlayerBase,
) -> ApiReturnPlayer:
    repo = PlayerRepository(db)
    player = repo.get_by_id(player_id)
    if not player:
        raise PlayerNotFoundError(player_id)

    team = get_team_by_name(db, team_name)
    if player.team_id != team.id:
        raise PlayerNotFoundError(player_id)
    if team.user_id != user_id:
        raise ForbiddenError()

    try:
        categories = resolve_categories(db, player_in.category_names)
    except ValueError:
        raise PlayerNotFoundError(player_id)

    return ApiReturnPlayer.model_validate(
        repo.update_player(player, player_in, categories)
    )


def delete_player(db: Session, player_id: int, team_name: str, user_id: int) -> None:
    repo = PlayerRepository(db)
    player = repo.get_by_id(player_id)
    if not player:
        raise PlayerNotFoundError(player_id)

    team = get_team_by_name(db, team_name)
    if player.team_id != team.id:
        raise PlayerNotFoundError(player_id)
    if team.user_id != user_id:
        raise ForbiddenError()

    repo.delete_player(player)
