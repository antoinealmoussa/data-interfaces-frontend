from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.applications.rugby_teams.schemas.season import ApiReturnSeason
from app.applications.rugby_teams.services.season_service import get_season_by_id, get_seasons
from app.core.token import get_current_active_user
from app.db.session import get_db
from app.models.user import User

router = APIRouter()

@router.get("", response_model=List[ApiReturnSeason])
def read_seasons(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[ApiReturnSeason]:
    return get_seasons(db, skip=skip, limit=limit)

@router.get("/{season_id}", response_model=ApiReturnSeason)
def read_season(
    season_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> ApiReturnSeason:
    season = get_season_by_id(db, season_id)
    if not season:
        raise HTTPException(status_code=404, detail="Saison non trouvée")
    return season
