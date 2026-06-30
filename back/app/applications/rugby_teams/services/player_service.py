from sqlalchemy.orm import Session

from app.db.repositories import PlayerRepository
from app.models.player import Player
from app.schemas.player import ApiCreatePlayer, ApiReturnPlayer, ApiUpdatePlayer
from app.services.category_service import resolve_categories
from app.services.team_service import get_team_by_name
from app.utils.exceptions import ForbiddenError, PlayerNotFoundError


def get_player_by_id(db: Session, player_id: int) -> Player | None:
    repo = PlayerRepository(db)
    return repo.get_by_id(player_id)


def get_players_by_team(db: Session, team_name: str, skip: int = 0, limit: int = 100):
    team = get_team_by_name(db, team_name)
    repo = PlayerRepository(db)
    return repo.get_by_team(team.id, skip, limit)


def create_player(
    db: Session, team_name: str, player_in: ApiCreatePlayer, user_id: int
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
    player_in: ApiUpdatePlayer,
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

    player.name = player_in.name
    player.level = player_in.level
    player.sex = player_in.sex
    player.position = player_in.position
    player.categories = categories

    db.commit()
    db.refresh(player)
    return ApiReturnPlayer.model_validate(player)


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

    db.delete(player)
    db.commit()
