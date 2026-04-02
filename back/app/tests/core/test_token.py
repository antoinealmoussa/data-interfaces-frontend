import pytest
from datetime import timedelta
from jose import jwt
from app.core.token import create_access_token, get_current_user, get_current_active_user
from app.core.config import settings
from app.services import user_service
from app.schemas.user import ApiCreateUser
from fastapi import HTTPException


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


@pytest.mark.asyncio
async def test_get_current_user_valid_token(db_session):
    """Test get_current_user avec un token valide."""
    user = ApiCreateUser(
        email="token@test.com",
        password="password",
        first_name="Token",
        surname="User"
    )
    created_user = user_service.create_user(db_session, user_in=user)

    token = create_access_token(data={"sub": created_user.email, "token_version": created_user.token_version})

    current_user = await get_current_user(token, db_session)

    assert current_user is not None
    assert current_user.email == created_user.email


@pytest.mark.asyncio
async def test_get_current_user_invalid_token():
    """Test get_current_user avec un token invalide."""
    invalid_token = "invalid.token.here"

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(invalid_token, None)

    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_expired_token(db_session):
    """Test get_current_user avec un token expiré."""
    user = ApiCreateUser(
        email="expired@test.com",
        password="password",
        first_name="Expired",
        surname="User"
    )
    created_user = user_service.create_user(db_session, user_in=user)

    token = create_access_token(
        data={"sub": created_user.email, "token_version": created_user.token_version},
        expires_delta=timedelta(seconds=-1)
    )

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(token, db_session)

    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_revoked_token(db_session):
    """Test get_current_user avec un token révoqué."""
    user = ApiCreateUser(
        email="revoked@test.com",
        password="password",
        first_name="Revoked",
        surname="User"
    )
    created_user = user_service.create_user(db_session, user_in=user)
    original_version = created_user.token_version

    token = create_access_token(data={"sub": created_user.email, "token_version": original_version})

    user_service.revoke_tokens(db_session, created_user)

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(token, db_session)

    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_get_current_active_user(db_session):
    """Test get_current_active_user."""
    user = ApiCreateUser(
        email="active@test.com",
        password="password",
        first_name="Active",
        surname="User"
    )
    created_user = user_service.create_user(db_session, user_in=user)

    active_user = await get_current_active_user(created_user)

    assert active_user is not None
    assert active_user.email == created_user.email
