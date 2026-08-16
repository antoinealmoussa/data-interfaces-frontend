from datetime import timedelta
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app.core.dependencies import get_current_active_user, get_current_admin, get_current_user
from app.core.jwt import create_access_token
from app.schemas.user import ApiCreateUser
from app.services import user_service
from app.utils.exceptions import ForbiddenError


def create_mock_request_with_cookie(cookie_name: str, cookie_value: str) -> MagicMock:
    mock_request = MagicMock()
    mock_request.cookies = {cookie_name: cookie_value}
    return mock_request


def create_mock_request_without_cookie() -> MagicMock:
    mock_request = MagicMock()
    mock_request.cookies = {}
    return mock_request


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

    token = create_access_token(
        data={"sub": created_user.email, "token_version": created_user.token_version}
    )
    mock_request = create_mock_request_with_cookie("access_token", token)

    current_user = await get_current_user(mock_request, db_session)

    assert current_user is not None
    assert current_user.email == created_user.email


@pytest.mark.asyncio
async def test_get_current_user_invalid_token():
    """Test get_current_user avec un token invalide."""
    mock_request = create_mock_request_with_cookie("access_token", "invalid.token.here")

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(mock_request, None)

    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_missing_cookie(db_session):
    """Test get_current_user sans cookie."""
    mock_request = create_mock_request_without_cookie()

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(mock_request, db_session)

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
    mock_request = create_mock_request_with_cookie("access_token", token)

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(mock_request, db_session)

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
    mock_request = create_mock_request_with_cookie("access_token", token)

    user_service.revoke_tokens(db_session, created_user)

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(mock_request, db_session)

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


@pytest.mark.asyncio
async def test_get_current_user_token_without_sub(db_session):
    """Test get_current_user avec un token sans 'sub'."""
    token = create_access_token(data={"token_version": 1})
    mock_request = create_mock_request_with_cookie("access_token", token)

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(mock_request, db_session)

    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_token_without_token_version(db_session):
    """Test get_current_user avec un token sans 'token_version'."""
    token = create_access_token(data={"sub": "no-version@test.com"})
    mock_request = create_mock_request_with_cookie("access_token", token)

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(mock_request, db_session)

    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_user_not_found(db_session):
    """Test get_current_user quand l'utilisateur n'existe pas en base."""
    token = create_access_token(
        data={"sub": "nonexistent@test.com", "token_version": 1}
    )
    mock_request = create_mock_request_with_cookie("access_token", token)

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(mock_request, db_session)

    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_with_bearer_token(db_session):
    """Test get_current_user avec Authorization: Bearer header."""
    user = ApiCreateUser(
        email="bearer@test.com",
        password="password",
        first_name="Bearer",
        surname="User"
    )
    created_user = user_service.create_user(db_session, user_in=user)

    token = create_access_token(
        data={"sub": created_user.email, "token_version": created_user.token_version}
    )

    mock_request = MagicMock()
    mock_request.cookies = {}
    mock_request.headers = {"Authorization": f"Bearer {token}"}

    current_user = await get_current_user(mock_request, db_session)
    assert current_user is not None
    assert current_user.email == created_user.email


@pytest.mark.asyncio
async def test_get_current_user_bearer_missing_token(db_session):
    """Test get_current_user avec Authorization: Bearer sans token."""
    mock_request = MagicMock()
    mock_request.cookies = {}
    mock_request.headers = {"Authorization": "Bearer "}

    with pytest.raises(HTTPException) as exc_info:
        await get_current_user(mock_request, db_session)

    assert exc_info.value.status_code == 401


@pytest.mark.asyncio
async def test_get_current_admin_forbidden(test_user):
    """Test get_current_admin avec un utilisateur normal → 403."""
    with pytest.raises(ForbiddenError):
        await get_current_admin(test_user)


@pytest.mark.asyncio
async def test_get_current_admin_success(admin_user):
    """Test get_current_admin avec un admin → passe."""
    assert (await get_current_admin(admin_user)).id == admin_user.id
