from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.applications.bike_exploration.schemas.col import ApiReturnCol
from app.applications.bike_exploration.services.col_service import get_cols, get_conquered_cols
from app.core.token import get_current_active_user
from app.db.session import get_db
from app.models.user import User

router = APIRouter()


@router.get("", response_model=list[ApiReturnCol])
def list_cols(
    db: Session = Depends(get_db),
):
    return [ApiReturnCol.model_validate(c) for c in get_cols(db)]


@router.get("/conquered", response_model=list[ApiReturnCol])
def conquered_cols(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return [ApiReturnCol.model_validate(c) for c in get_conquered_cols(db, current_user.id)]
