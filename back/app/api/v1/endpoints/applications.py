from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.application import ApiReturnApplication
from app.services import application_service

router = APIRouter()


@router.get("", response_model=list[ApiReturnApplication])
def list_applications(
    db: Session = Depends(get_db),
) -> list[ApiReturnApplication]:
    """Liste toutes les applications disponibles (public)."""
    return application_service.list_applications(db)
