from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.training import (
    DistributeInput,
    DistributeOutput,
    AlgorithmInfo,
)
from app.services.training.registry import get_algorithm, get_all_algorithms
from app.core.token import get_current_active_user
from app.models.user import User
from app.models.player import Player

router = APIRouter(prefix="/teams/{team_name}/training")


@router.get("/algorithms", response_model=List[AlgorithmInfo])
def list_algorithms(
    team_name: str,
    current_user: User = Depends(get_current_active_user),
) -> List[AlgorithmInfo]:
    return get_all_algorithms()


@router.post("/distribute", response_model=DistributeOutput)
def distribute(
    team_name: str,
    input: DistributeInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> DistributeOutput:
    algorithm = get_algorithm(input.algorithm)
    if not algorithm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Algorithme '{input.algorithm}' inconnu",
        )

    players = (
        db.query(Player)
        .filter(Player.id.in_(input.player_ids), Player.team.has(name=team_name))
        .all()
    )

    if len(players) != len(input.player_ids):
        found_ids = {p.id for p in players}
        missing = set(input.player_ids) - found_ids
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Joueurs non trouvés : {missing}",
        )

    if len(players) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Au moins 2 joueurs sont requis",
        )

    return algorithm.distribute(input, players)
