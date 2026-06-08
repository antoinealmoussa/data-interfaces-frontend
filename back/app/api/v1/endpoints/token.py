from fastapi import APIRouter, HTTPException, status, Request, Response, Depends
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core.config import settings
from app.core.token import create_access_token
from app.api.v1.helpers import set_auth_cookie, delete_refresh_cookie
from app.services.user_service import get_user_by_email
from app.db.session import get_db


router = APIRouter()


@router.post("/refresh", status_code=status.HTTP_200_OK)
def refresh_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> dict:
    refresh_token = request.cookies.get(settings.REFRESH_TOKEN_COOKIE_NAME)
    if not refresh_token:
        delete_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token manquant",
        )

    try:
        payload = jwt.decode(
            refresh_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Type de token invalide",
            )

        email: str = payload.get("sub")
        token_version: int = payload.get("token_version")

        if email is None or token_version is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token invalide",
            )

    except JWTError:
        delete_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token invalide ou expiré",
        )

    user = get_user_by_email(db, email)
    if user is None or user.token_version != token_version:
        delete_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token révoqué",
        )

    new_access_token = create_access_token(
        data={"sub": user.email, "token_version": user.token_version}
    )
    set_auth_cookie(response, new_access_token)

    return {"message": "Token rafraîchi avec succès"}
