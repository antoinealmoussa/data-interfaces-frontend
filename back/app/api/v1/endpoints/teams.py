from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.team import ApiCreateTeam, ApiReturnTeam
from app.services import team_service
from app.core.token import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[ApiReturnTeam])
def read_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.get_teams_by_user(db, user_id=current_user.id)

@router.get("/has-teams", response_model=bool)
def check_user_has_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.has_user_teams(db, user_id=current_user.id)

@router.get("/by-season/{season_id}", response_model=List[ApiReturnTeam])
def read_teams_by_season(
    season_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.get_teams_by_season(db, season_id=season_id)

@router.post("/", response_model=ApiReturnTeam, status_code=status.HTTP_201_CREATED)
def create_team(team_in: ApiCreateTeam, db: Session = Depends(get_db)):
    return team_service.create_team(db, team_in=team_in)
