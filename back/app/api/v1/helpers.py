from dataclasses import dataclass
from typing import Optional

from fastapi import Response

from app.core.config import settings


@dataclass(frozen=True)
class CookieSettings:
    name: str
    httponly: bool
    secure: bool
    samesite: str
    path: str
    max_age: Optional[int] = None


_COOKIE_SETTINGS = {
    "access": CookieSettings(
        name=settings.ACCESS_TOKEN_COOKIE_NAME,
        httponly=settings.ACCESS_TOKEN_COOKIE_HTTPONLY,
        secure=settings.ACCESS_TOKEN_COOKIE_SECURE,
        samesite=settings.ACCESS_TOKEN_COOKIE_SAMESITE,
        path=settings.ACCESS_TOKEN_COOKIE_PATH,
        max_age=settings.ACCESS_TOKEN_COOKIE_MAX_AGE,
    ),
    "refresh": CookieSettings(
        name=settings.REFRESH_TOKEN_COOKIE_NAME,
        httponly=settings.REFRESH_TOKEN_COOKIE_HTTPONLY,
        secure=settings.REFRESH_TOKEN_COOKIE_SECURE,
        samesite=settings.REFRESH_TOKEN_COOKIE_SAMESITE,
        path=settings.REFRESH_TOKEN_COOKIE_PATH,
        max_age=settings.REFRESH_TOKEN_COOKIE_MAX_AGE,
    ),
}


def set_cookie(response: Response, kind: str, token: str) -> None:
    cs = _COOKIE_SETTINGS[kind]
    response.set_cookie(
        key=cs.name,
        value=token,
        httponly=cs.httponly,
        secure=cs.secure,
        samesite=cs.samesite,
        path=cs.path,
        max_age=cs.max_age,
    )


def delete_cookie(response: Response, kind: str) -> None:
    cs = _COOKIE_SETTINGS[kind]
    response.delete_cookie(key=cs.name, path=cs.path)


def set_auth_cookie(response: Response, token: str) -> None:
    set_cookie(response, "access", token)


def delete_auth_cookie(response: Response) -> None:
    delete_cookie(response, "access")


def set_refresh_cookie(response: Response, token: str) -> None:
    set_cookie(response, "refresh", token)


def delete_refresh_cookie(response: Response) -> None:
    delete_cookie(response, "refresh")
