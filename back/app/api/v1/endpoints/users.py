from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.user import ApiReturnUser, ApiCreateUser, ApiLoginUser
from app.services import user_service

router = APIRouter()


@router.get("/", response_model=List[ApiReturnUser])
def read_users(db: Session = Depends(get_db)):
    return user_service.get_all_users(db)


@router.post("/register", response_model=ApiReturnUser, status_code=status.HTTP_201_CREATED)
def register(user_in: ApiCreateUser, db: Session = Depends(get_db)):
    user = user_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="Cet email est déjà utilisé."
        )
    return user_service.create_user(db, user_in=user_in)


@router.post("/login")
def login(user_in: ApiLoginUser, db: Session = Depends(get_db)):
    user = user_service.authenticate_user(
        db, email=user_in.email, password=user_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
        )
    # Note: Ici tu généreras ton Token JWT plus tard
    return {"message": "Connexion réussie", "user": user.email}
