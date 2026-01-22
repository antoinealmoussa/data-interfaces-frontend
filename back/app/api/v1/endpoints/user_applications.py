from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.application import ApiReturnApplication
from app.services import user_service

router = APIRouter()


@router.get("/{user_id}", response_model=List[ApiReturnApplication], status_code=status.HTTP_200_OK)
def get_user_applications(user_id: int, db: Session = Depends(get_db)):
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    return [ApiReturnApplication(name=app.name, pretty_name=app.pretty_name) for app in user.applications]
