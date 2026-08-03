from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt

from app.core.config import settings


def _encode_token(data: dict, token_type: str, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode.update({"exp": expire, "type": token_type})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    delta = expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return _encode_token(data, "access", delta)


def create_refresh_token(data: dict) -> str:
    return _encode_token(
        data,
        "refresh",
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )


def decode_token(token: str) -> dict:
    """Décode un JWT et retourne son payload. Lève JWTError si invalide."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
