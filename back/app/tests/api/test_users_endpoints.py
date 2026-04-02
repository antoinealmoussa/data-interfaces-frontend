import pytest
from fastapi import status
from app.services import user_service


def test_read_users_empty(client):
    """Test GET /api/v1/users/ avec une base vide."""
    response = client.get("/api/v1/users/")

    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_read_users_with_data(client):
    """Test GET /api/v1/users/ avec des utilisateurs."""
    user1_data = {
        "email": "user1@test.com",
        "password": "password1",
        "first_name": "John",
        "surname": "Doe"
    }
    user2_data = {
        "email": "user2@test.com",
        "password": "password2",
        "first_name": "Jane",
        "surname": "Smith"
    }

    client.post("/api/v1/users/register", json=user1_data)
    client.post("/api/v1/users/register", json=user2_data)

    response = client.get("/api/v1/users/")

    assert response.status_code == status.HTTP_200_OK
    users = response.json()
    assert len(users) == 2
    emails = {u["email"] for u in users}
    assert emails == {"user1@test.com", "user2@test.com"}
    assert "password" not in users[0]
    assert "password" not in users[1]


def test_read_users_response_structure(client):
    """Test que la structure de la réponse GET /api/v1/users/ est correcte."""
    user_data = {
        "email": "struct@test.com",
        "password": "password123",
        "first_name": "Struct",
        "surname": "Test"
    }

    client.post("/api/v1/users/register", json=user_data)

    response = client.get("/api/v1/users/")
    users = response.json()

    assert len(users) > 0
    user = users[0]
    assert "id" in user
    assert "email" in user
    assert "first_name" in user
    assert "surname" in user
    assert "password" not in user


def test_register_success(client):
    """Test POST /api/v1/users/register avec succès."""
    user_data = {
        "email": "register@test.com",
        "password": "password123",
        "first_name": "Register",
        "surname": "User"
    }

    response = client.post("/api/v1/users/register", json=user_data)

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "register@test.com"
    assert data["first_name"] == "Register"
    assert data["surname"] == "User"
    assert "id" in data
    assert "password" not in data


def test_register_duplicate_email(client):
    """Test POST /api/v1/users/register avec un email déjà existant."""
    user_data = {
        "email": "duplicate@test.com",
        "password": "password123",
        "first_name": "First",
        "surname": "User"
    }

    response1 = client.post("/api/v1/users/register", json=user_data)
    assert response1.status_code == status.HTTP_201_CREATED

    response2 = client.post("/api/v1/users/register", json=user_data)

    assert response2.status_code == 409
    detail = response2.json()["detail"].lower()
    assert "déjà utilisé" in detail or "email" in detail


def test_register_missing_fields(client):
    """Test POST /api/v1/users/register avec des champs manquants."""
    incomplete_data = {
        "email": "incomplete@test.com",
        "password": "password123"
    }

    response = client.post("/api/v1/users/register", json=incomplete_data)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_register_invalid_email_format(client):
    """Test POST /api/v1/users/register avec un format d'email invalide."""
    user_data = {
        "email": "not-an-email",
        "password": "password123",
        "first_name": "Invalid",
        "surname": "Email"
    }

    response = client.post("/api/v1/users/register", json=user_data)
    assert response.status_code in [
        status.HTTP_422_UNPROCESSABLE_CONTENT, status.HTTP_201_CREATED]


def test_login_success(client):
    """Test POST /api/v1/users/login avec succès."""
    user_data = {
        "email": "login@test.com",
        "password": "correct_password",
        "first_name": "Login",
        "surname": "User"
    }
    client.post("/api/v1/users/register", json=user_data)

    response = client.post(
        "/api/v1/users/login",
        data={"username": "login@test.com", "password": "correct_password"}
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    """Test POST /api/v1/users/login avec un mauvais mot de passe."""
    user_data = {
        "email": "login@test.com",
        "password": "correct_password",
        "first_name": "Login",
        "surname": "User"
    }
    client.post("/api/v1/users/register", json=user_data)

    response = client.post(
        "/api/v1/users/login",
        data={"username": "login@test.com", "password": "wrong_password"}
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "incorrect" in response.json()["detail"].lower()


def test_login_nonexistent_user(client):
    """Test POST /api/v1/users/login avec un utilisateur inexistant."""
    response = client.post(
        "/api/v1/users/login",
        data={"username": "nonexistent@test.com", "password": "any_password"}
    )

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "incorrect" in response.json()["detail"].lower()


def test_login_missing_fields(client):
    """Test POST /api/v1/users/login avec des champs manquants."""
    response = client.post(
        "/api/v1/users/login",
        data={"username": "test@test.com"}
    )

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_logout_success(authenticated_client):
    """Test POST /api/v1/users/logout avec un token valide."""
    response = authenticated_client.post("/api/v1/users/logout")

    assert response.status_code == status.HTTP_200_OK
    assert "message" in response.json()


def test_logout_unauthenticated(client):
    """Test POST /api/v1/users/logout sans token."""
    response = client.post("/api/v1/users/logout")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_read_users_me(authenticated_client):
    """Test GET /api/v1/users/me avec un token valide."""
    response = authenticated_client.get("/api/v1/users/me")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "user" in data
    assert "email" in data["user"]
    assert "first_name" in data["user"]
    assert "surname" in data["user"]
    assert "password" not in data["user"]


def test_read_users_me_unauthenticated(client):
    """Test GET /api/v1/users/me sans token."""
    response = client.get("/api/v1/users/me")

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
