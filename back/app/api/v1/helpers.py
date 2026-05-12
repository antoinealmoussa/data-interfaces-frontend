from fastapi import Response
from app.core.config import settings


def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=settings.ACCESS_TOKEN_COOKIE_NAME,
        value=token,
        httponly=settings.ACCESS_TOKEN_COOKIE_HTTPONLY,
        secure=settings.ACCESS_TOKEN_COOKIE_SECURE,
        samesite=settings.ACCESS_TOKEN_COOKIE_SAMESITE,
        path=settings.ACCESS_TOKEN_COOKIE_PATH,
        max_age=settings.ACCESS_TOKEN_COOKIE_MAX_AGE,
    )


def delete_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.ACCESS_TOKEN_COOKIE_NAME,
        path=settings.ACCESS_TOKEN_COOKIE_PATH,
    )
