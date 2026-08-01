from datetime import timedelta

from jose import jwt

from app.core.config import settings
from app.core.jwt import create_access_token, create_refresh_token, decode_token


def test_create_access_token():
    """Test que create_access_token crée un JWT valide."""
    data = {"sub": "test@example.com", "token_version": 1}

    token = create_access_token(data)

    assert token is not None
    assert isinstance(token, str)
    assert len(token) > 0


def test_create_access_token_custom_expiry():
    """Test que create_access_token fonctionne avec expiration personnalisée."""
    data = {"sub": "test@example.com", "token_version": 1}
    expires_delta = timedelta(minutes=5)

    token = create_access_token(data, expires_delta=expires_delta)

    assert token is not None
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert decoded["sub"] == "test@example.com"
    assert decoded["token_version"] == 1


def test_create_access_token_has_type_access():
    token = create_access_token({"sub": "test@example.com", "token_version": 1})
    decoded = decode_token(token)
    assert decoded["type"] == "access"


def test_create_refresh_token_has_type_refresh():
    token = create_refresh_token({"sub": "test@example.com", "token_version": 1})
    decoded = decode_token(token)
    assert decoded["type"] == "refresh"
