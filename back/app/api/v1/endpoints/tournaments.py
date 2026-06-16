from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.token import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.tournament import (
    ApiCreateTournament,
    ApiReturnTournament,
    ApiUpdateTournament,
)
from app.services import tournament_service

router = APIRouter(prefix="/teams/{team_name}/tournaments")


@router.get("", response_model=List[ApiReturnTournament])
def read_tournaments(
    team_name: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[ApiReturnTournament]:
    tournaments = tournament_service.get_tournaments_by_team(
        db, team_name, skip=skip, limit=limit
    )
    return [ApiReturnTournament.model_validate(t) for t in tournaments]


@router.get("/{tournament_id}", response_model=ApiReturnTournament)
def read_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ApiReturnTournament:
    tournament = tournament_service.get_tournament_by_id(db, tournament_id)
    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tournoi non trouvé",
        )
    return ApiReturnTournament.model_validate(tournament)


@router.post(
    "",
    response_model=ApiReturnTournament,
    status_code=status.HTTP_201_CREATED,
)
def create_tournament(
    team_name: str,
    tournament_in: ApiCreateTournament,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ApiReturnTournament:
    return tournament_service.create_tournament(db, team_name, tournament_in, current_user.id)


@router.put("/{tournament_id}", response_model=ApiReturnTournament)
def update_tournament(
    team_name: str,
    tournament_id: int,
    tournament_in: ApiUpdateTournament,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ApiReturnTournament:
    return tournament_service.update_tournament(
        db, tournament_id, team_name, tournament_in, current_user.id
    )


@router.delete("/{tournament_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tournament(
    team_name: str,
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> None:
    tournament_service.delete_tournament(db, tournament_id, team_name, current_user.id)
