from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.applications.rugby_teams.schemas.training import (
    AlgorithmInfo,
    DistributeInput,
    DistributeOutput,
)
from app.applications.rugby_teams.services import training_service
from app.core.dependencies import get_current_active_user
from app.db.session import get_db
from app.models.user import User

router = APIRouter(prefix="/teams/{team_name}/training")


@router.get("/algorithms", response_model=List[AlgorithmInfo])
def list_algorithms(
    team_name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[AlgorithmInfo]:
    return training_service.list_algorithms(db, team_name, current_user.id)


@router.post("/distribute", response_model=DistributeOutput)
def distribute(
    team_name: str,
    input: DistributeInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> DistributeOutput:
    return training_service.distribute(db, team_name, current_user.id, input)
