from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List
from fastapi.security import OAuth2PasswordRequestForm

from app.db.session import get_db
from app.schemas.user import (
    ApiReturnUser,
    ApiCreateUser,
    Token,
    ApiReturnUserWithApplications,
    ApiUpdateUser,
)
from app.services import user_service
from app.core.token import create_access_token, create_refresh_token, get_current_active_user
from app.api.v1.helpers import set_auth_cookie, delete_auth_cookie, set_refresh_cookie, delete_refresh_cookie
from app.models.user import User

router = APIRouter()


@router.get("/", response_model=List[ApiReturnUser], status_code=status.HTTP_200_OK)
def read_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> List[ApiReturnUser]:
    return user_service.get_all_users(db)


@router.post(
    "/register", response_model=ApiReturnUser, status_code=status.HTTP_201_CREATED
)
def register(user_in: ApiCreateUser, db: Session = Depends(get_db)) -> ApiReturnUser:
    try:
        new_user = user_service.create_user(db, user_in=user_in)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

    return new_user


@router.post("/login", status_code=status.HTTP_200_OK)
def login(
    response: Response,
    user_in: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> dict:
    user = user_service.authenticate_user(
        db, email=user_in.username, password=user_in.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": user.email, "token_version": user.token_version}
    )
    refresh_token = create_refresh_token(
        data={"sub": user.email, "token_version": user.token_version}
    )

    set_auth_cookie(response, access_token)
    set_refresh_cookie(response, refresh_token)

    return {"message": "Login successful"}


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(
    response: Response,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> dict:
    user_service.revoke_tokens(db, current_user)

    delete_auth_cookie(response)
    delete_refresh_cookie(response)

    return {"message": "Successfully logged out"}


@router.get("/me", response_model=ApiReturnUserWithApplications)
async def read_users_me(current_user: User = Depends(get_current_active_user)) -> dict:
    return {"user": current_user, "applications": current_user.applications}


@router.put("/me", response_model=ApiReturnUser, status_code=status.HTTP_200_OK)
def update_user(
    user_in: ApiUpdateUser,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> ApiReturnUser:
    try:
        updated_user = user_service.update_user(
            db, user_id=current_user.id, user_in=user_in
        )
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

    return updated_user
