
from fastapi import status
from jose import jwt

from app.core.config import settings

REFRESH_URL = "/api/v1/token/refresh"


def test_refresh_token_missing_cookie(client):
    response = client.post(REFRESH_URL)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "manquant" in response.json()["detail"].lower()


def test_refresh_token_invalid(client):
    client.cookies.set("refresh_token", "invalid.token.here")
    response = client.post(REFRESH_URL)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_refresh_token_wrong_type(client, test_user):
    from app.core.token import create_access_token
    token = create_access_token(
        data={"sub": test_user.email, "token_version": test_user.token_version}
    )
    client.cookies.set("refresh_token", token)
    response = client.post(REFRESH_URL)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "type" in response.json()["detail"].lower()


def test_refresh_token_missing_sub(client):
    refresh_token = jwt.encode(
        {"type": "refresh", "token_version": 1},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    client.cookies.set("refresh_token", refresh_token)
    response = client.post(REFRESH_URL)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_refresh_token_success(client, test_user):
    from app.core.token import create_refresh_token
    refresh_token = create_refresh_token(
        data={"sub": test_user.email, "token_version": test_user.token_version},
    )
    client.cookies.set("refresh_token", refresh_token)
    response = client.post(REFRESH_URL)
    assert response.status_code == status.HTTP_200_OK
    assert "access_token" in response.cookies
