import pytest
from app.services import user_service
from app.schemas.user import ApiCreateUser
from app.models.user import User


def test_get_all_users_empty(db_session):
    """Test get_all_users avec une base vide."""
    users = user_service.get_all_users(db_session)

    assert users == []


def test_get_all_users_with_data(db_session):
    """Test get_all_users avec des utilisateurs."""
    user1 = ApiCreateUser(
        email="user1@test.com",
        password="password1",
        first_name="John",
        surname="Doe"
    )
    user2 = ApiCreateUser(
        email="user2@test.com",
        password="password2",
        first_name="Jane",
        surname="Smith"
    )

    user_service.create_user(db_session, user_in=user1)
    user_service.create_user(db_session, user_in=user2)

    users = user_service.get_all_users(db_session)

    assert len(users) == 2


def test_get_user_by_email_exists(db_session):
    """Test get_user_by_email avec un email existant."""
    user = ApiCreateUser(
        email="findme@test.com",
        password="password",
        first_name="Find",
        surname="Me"
    )
    user_service.create_user(db_session, user_in=user)

    found_user = user_service.get_user_by_email(db_session, email="findme@test.com")

    assert found_user is not None
    assert found_user.email == "findme@test.com"
    assert found_user.first_name == "Find"
    assert found_user.surname == "Me"


def test_get_user_by_email_not_exists(db_session):
    """Test get_user_by_email avec un email inexistant."""
    found_user = user_service.get_user_by_email(db_session, email="nonexistent@test.com")

    assert found_user is None


def test_get_user_by_id_not_exists(db_session):
    """Test get_user_by_id avec un ID inexistant."""
    found_user = user_service.get_user_by_id(db_session, user_id=99999)

    assert found_user is None


def test_get_user_by_id_exists(db_session):
    """Test get_user_by_id avec un ID existant."""
    user = ApiCreateUser(
        email="findbyid@test.com",
        password="password",
        first_name="Find",
        surname="ById"
    )
    created_user = user_service.create_user(db_session, user_in=user)

    found_user = user_service.get_user_by_id(db_session, user_id=created_user.id)

    assert found_user is not None
    assert found_user.id == created_user.id
    assert found_user.email == "findbyid@test.com"


def test_get_user_by_email_case_sensitive(db_session):
    """Test que get_user_by_email est sensible à la casse."""
    user = ApiCreateUser(
        email="Case@test.com",
        password="password",
        first_name="Case",
        surname="Sensitive"
    )
    user_service.create_user(db_session, user_in=user)

    found_user = user_service.get_user_by_email(db_session, email="case@test.com")

    assert found_user is None


def test_create_user_success(db_session):
    """Test create_user avec des données valides."""
    user = ApiCreateUser(
        email="create@test.com",
        password="password123",
        first_name="Create",
        surname="User"
    )

    created_user = user_service.create_user(db_session, user_in=user)

    assert created_user.email == "create@test.com"
    assert created_user.first_name == "Create"
    assert created_user.surname == "User"
    assert created_user.password != "password123"


def test_create_user_password_hashed(db_session):
    """Test que le mot de passe est bien hashé."""
    user = ApiCreateUser(
        email="hash@test.com",
        password="plain_password",
        first_name="Hash",
        surname="Test"
    )

    created_user = user_service.create_user(db_session, user_in=user)

    assert created_user.password != "plain_password"
    assert len(created_user.password) > 20


def test_create_user_persisted(db_session):
    """Test que l'utilisateur est bien persisté en base."""
    user = ApiCreateUser(
        email="persist@test.com",
        password="password",
        first_name="Persist",
        surname="Test"
    )

    created_user = user_service.create_user(db_session, user_in=user)
    db_session.commit()

    found_user = user_service.get_user_by_email(db_session, email="persist@test.com")

    assert found_user is not None
    assert found_user.id == created_user.id


def test_authenticate_user_success(db_session):
    """Test authenticate_user avec des identifiants valides."""
    user = ApiCreateUser(
        email="auth@test.com",
        password="correct_password",
        first_name="Auth",
        surname="User"
    )
    user_service.create_user(db_session, user_in=user)

    authenticated_user = user_service.authenticate_user(
        db_session, email="auth@test.com", password="correct_password"
    )

    assert authenticated_user is not False
    assert authenticated_user.email == "auth@test.com"


def test_authenticate_user_wrong_password(db_session):
    """Test authenticate_user avec un mauvais mot de passe."""
    user = ApiCreateUser(
        email="auth2@test.com",
        password="correct_password",
        first_name="Auth",
        surname="User"
    )
    user_service.create_user(db_session, user_in=user)

    authenticated_user = user_service.authenticate_user(
        db_session, email="auth2@test.com", password="wrong_password"
    )

    assert authenticated_user is False


def test_authenticate_user_nonexistent_email(db_session):
    """Test authenticate_user avec un email inexistant."""
    authenticated_user = user_service.authenticate_user(
        db_session, email="nonexistent@test.com", password="any_password"
    )

    assert authenticated_user is False


def test_authenticate_user_empty_password(db_session):
    """Test authenticate_user avec un mot de passe vide."""
    user = ApiCreateUser(
        email="empty@test.com",
        password="correct_password",
        first_name="Empty",
        surname="Password"
    )
    user_service.create_user(db_session, user_in=user)

    authenticated_user = user_service.authenticate_user(
        db_session, email="empty@test.com", password=""
    )

    assert authenticated_user is False


def test_revoke_tokens(db_session):
    """Test que revoke_tokens incrémente token_version."""
    user = ApiCreateUser(
        email="revoke@test.com",
        password="password",
        first_name="Revoke",
        surname="Test"
    )
    created_user = user_service.create_user(db_session, user_in=user)

    initial_version = created_user.token_version

    user_service.revoke_tokens(db_session, created_user)

    db_session.refresh(created_user)
    assert created_user.token_version == initial_version + 1


def test_update_user_success(db_session):
    """Test update_user avec des données valides."""
    from app.schemas.user import ApiUpdateUser
    user = ApiCreateUser(
        email="update@test.com",
        password="password",
        first_name="Update",
        surname="Test"
    )
    created_user = user_service.create_user(db_session, user_in=user)

    update_data = ApiUpdateUser(
        first_name="UpdatedFirst",
        surname="UpdatedSurname",
        email="updated@test.com"
    )

    updated_user = user_service.update_user(db_session, user_id=created_user.id, user_in=update_data)

    assert updated_user is not None
    assert updated_user.id == created_user.id
    assert updated_user.first_name == "UpdatedFirst"
    assert updated_user.surname == "UpdatedSurname"
    assert updated_user.email == "updated@test.com"


def test_update_user_partial(db_session):
    """Test update_user avec mise à jour partielle."""
    from app.schemas.user import ApiUpdateUser
    user = ApiCreateUser(
        email="partial@test.com",
        password="password",
        first_name="Partial",
        surname="Test"
    )
    created_user = user_service.create_user(db_session, user_in=user)

    update_data = ApiUpdateUser(first_name="NewFirst")

    updated_user = user_service.update_user(db_session, user_id=created_user.id, user_in=update_data)

    assert updated_user is not None
    assert updated_user.first_name == "NewFirst"
    assert updated_user.surname == "Test"
    assert updated_user.email == "partial@test.com"


def test_update_user_not_found(db_session):
    """Test update_user avec un ID inexistant."""
    from app.schemas.user import ApiUpdateUser
    update_data = ApiUpdateUser(first_name="NewFirst")

    updated_user = user_service.update_user(db_session, user_id=99999, user_in=update_data)

    assert updated_user is None
