from typing import List

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.applications.rugby_teams.schemas.player import (
    ApiCreatePlayer,
    ApiReturnPlayer,
    ApiUpdatePlayer,
)
from app.applications.rugby_teams.services import player_service
from app.core.token import get_current_active_user
from app.db.session import get_db
from app.models.user import User

router = APIRouter(prefix="/teams/{team_name}/players")


@router.get("", response_model=List[ApiReturnPlayer])
def read_players(
    team_name: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[ApiReturnPlayer]:
    players = player_service.get_players_by_team(db, team_name, skip=skip, limit=limit)
    return [ApiReturnPlayer.model_validate(p) for p in players]


@router.post("", response_model=ApiReturnPlayer, status_code=status.HTTP_201_CREATED)
def create_player(
    team_name: str,
    player_in: ApiCreatePlayer,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ApiReturnPlayer:
    return player_service.create_player(db, team_name, player_in, current_user.id)


@router.put("/{player_id}", response_model=ApiReturnPlayer)
def update_player(
    team_name: str,
    player_id: int,
    player_in: ApiUpdatePlayer,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ApiReturnPlayer:
    return player_service.update_player(db, player_id, team_name, current_user.id, player_in)


@router.delete("/{player_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_player(
    team_name: str,
    player_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> None:
    player_service.delete_player(db, player_id, team_name, current_user.id)
