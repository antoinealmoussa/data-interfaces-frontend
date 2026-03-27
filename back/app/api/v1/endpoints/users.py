from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from fastapi.security import OAuth2PasswordRequestForm

from app.db.session import get_db
from app.schemas.user import ApiReturnUser, ApiCreateUser, Token, ApiReturnUserWithApplications
from app.services import user_service
from app.core.token import create_access_token, get_current_active_user
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[ApiReturnUser], status_code=status.HTTP_200_OK)
def read_users(
    db: Session = Depends(get_db)
):
    return user_service.get_all_users(db)

@router.post("/register", response_model=ApiReturnUser, status_code=status.HTTP_201_CREATED)
def register(
    user_in: ApiCreateUser, 
    db: Session = Depends(get_db)
):
    user = user_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=409,
            detail="Cet email est déjà utilisé."
        )
    new_user = user_service.create_user(db, user_in=user_in)

    return new_user

@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
def login(
    user_in: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    user = user_service.authenticate_user(
        db, email=user_in.username, password=user_in.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=ApiReturnUserWithApplications)
async def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    return {
        "user": current_user,
        "applications": current_user.applications
    }