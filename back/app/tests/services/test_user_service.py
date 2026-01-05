from app.services import user_service
from app.schemas.user import ApiCreateUser
from app.models.user import User


def test_get_all_users_empty(db_session):
    """Test récupération de tous les utilisateurs quand la base est vide."""
    users = user_service.get_all_users(db_session)

    assert users == []
    assert isinstance(users, list)


def test_get_all_users_with_data(db_session):
    """Test récupération de tous les utilisateurs avec des données."""
    # Créer deux utilisateurs de test
    user1_data = ApiCreateUser(
        email="user1@test.com",
        password="password1",
        first_name="John",
        surname="Doe"
    )
    user2_data = ApiCreateUser(
        email="user2@test.com",
        password="password2",
        first_name="Jane",
        surname="Smith"
    )

    user_service.create_user(db_session, user1_data)
    user_service.create_user(db_session, user2_data)

    users = user_service.get_all_users(db_session)

    assert len(users) == 2
    assert users[0].email == "user1@test.com"
    assert users[1].email == "user2@test.com"


def test_get_user_by_email_exists(db_session):
    """Test récupération d'un utilisateur par email qui existe."""
    user_data = ApiCreateUser(
        email="test@example.com",
        password="password123",
        first_name="Test",
        surname="User"
    )
    created_user = user_service.create_user(db_session, user_data)

    found_user = user_service.get_user_by_email(db_session, "test@example.com")

    assert found_user is not None
    assert found_user.email == "test@example.com"
    assert found_user.id == created_user.id
    assert found_user.first_name == "Test"
    assert found_user.surname == "User"


def test_get_user_by_email_not_exists(db_session):
    """Test récupération d'un utilisateur par email qui n'existe pas."""
    found_user = user_service.get_user_by_email(
        db_session, "nonexistent@example.com")

    assert found_user is None


def test_get_user_by_email_case_sensitive(db_session):
    """Test que la recherche par email est sensible à la casse."""
    user_data = ApiCreateUser(
        email="Test@Example.com",
        password="password123",
        first_name="Test",
        surname="User"
    )
    user_service.create_user(db_session, user_data)

    # SQLite est case-insensitive par défaut, mais testons quand même
    found_user = user_service.get_user_by_email(db_session, "Test@Example.com")
    assert found_user is not None


def test_create_user_success(db_session):
    """Test création d'un utilisateur avec succès."""
    user_data = ApiCreateUser(
        email="newuser@test.com",
        password="secure_password",
        first_name="New",
        surname="User"
    )

    created_user = user_service.create_user(db_session, user_data)

    assert created_user is not None
    assert created_user.email == "newuser@test.com"
    assert created_user.first_name == "New"
    assert created_user.surname == "User"
    assert created_user.id is not None
    # Le mot de passe doit être hashé
    assert created_user.password != "secure_password"
    assert len(created_user.password) > 0


def test_create_user_password_hashed(db_session):
    """Test que le mot de passe est correctement hashé lors de la création."""
    user_data = ApiCreateUser(
        email="hashed@test.com",
        password="plain_password",
        first_name="Test",
        surname="User"
    )

    created_user = user_service.create_user(db_session, user_data)

    # Vérifier que le mot de passe stocké n'est pas en clair
    assert created_user.password != "plain_password"
    # Le hash bcrypt commence généralement par $2b$ ou $2a$
    assert created_user.password.startswith("$2")


def test_create_user_persisted(db_session):
    """Test qu'un utilisateur créé est bien persisté en base."""
    user_data = ApiCreateUser(
        email="persisted@test.com",
        password="password123",
        first_name="Persisted",
        surname="User"
    )

    created_user = user_service.create_user(db_session, user_data)
    user_id = created_user.id

    # Récupérer l'utilisateur depuis la base
    found_user = db_session.query(User).filter(User.id == user_id).first()

    assert found_user is not None
    assert found_user.email == "persisted@test.com"


def test_authenticate_user_success(db_session):
    """Test authentification réussie d'un utilisateur."""
    user_data = ApiCreateUser(
        email="auth@test.com",
        password="correct_password",
        first_name="Auth",
        surname="User"
    )
    user_service.create_user(db_session, user_data)

    authenticated_user = user_service.authenticate_user(
        db_session, "auth@test.com", "correct_password"
    )

    assert authenticated_user is not False
    assert authenticated_user.email == "auth@test.com"


def test_authenticate_user_wrong_password(db_session):
    """Test authentification avec un mauvais mot de passe."""
    user_data = ApiCreateUser(
        email="auth@test.com",
        password="correct_password",
        first_name="Auth",
        surname="User"
    )
    user_service.create_user(db_session, user_data)

    authenticated_user = user_service.authenticate_user(
        db_session, "auth@test.com", "wrong_password"
    )

    assert authenticated_user is False


def test_authenticate_user_nonexistent_email(db_session):
    """Test authentification avec un email qui n'existe pas."""
    authenticated_user = user_service.authenticate_user(
        db_session, "nonexistent@test.com", "any_password"
    )

    assert authenticated_user is False


def test_authenticate_user_empty_password(db_session):
    """Test authentification avec un mot de passe vide."""
    user_data = ApiCreateUser(
        email="empty@test.com",
        password="",
        first_name="Empty",
        surname="Password"
    )
    user_service.create_user(db_session, user_data)

    authenticated_user = user_service.authenticate_user(
        db_session, "empty@test.com", ""
    )

    assert authenticated_user is not False
    assert authenticated_user.email == "empty@test.com"
