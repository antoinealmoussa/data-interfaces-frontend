from fastapi import Depends, HTTPException, Request, status
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.jwt import decode_token
from app.db.session import get_db
from app.models.user import User
from app.services.user_service import get_user_by_email


async def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """Retourne l'utilisateur courant depuis le JWT (cookie ou header Authorization)."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = request.cookies.get(settings.ACCESS_TOKEN_COOKIE_NAME)

    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]

    if not token:
        raise credentials_exception

    try:
        payload = decode_token(token)
        email: str = payload.get("sub")

        if email is None:
            raise credentials_exception

        if payload.get("type") == "refresh":
            raise credentials_exception

        token_version = payload.get("token_version")
        if token_version is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = get_user_by_email(db, email)
    if user is None:
        raise credentials_exception

    if user.token_version != token_version:
        raise credentials_exception

    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Retourne l'utilisateur courant, actif.

    Réservé pour extension future : bannissement, vérification email, etc.
    """
    return current_user
