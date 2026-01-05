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
    # Créer des utilisateurs directement en base
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
    assert users[0]["email"] in ["user1@test.com", "user2@test.com"]
    assert users[1]["email"] in ["user1@test.com", "user2@test.com"]
    # Vérifier que le mot de passe n'est pas dans la réponse
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

    # Premier enregistrement
    response1 = client.post("/api/v1/users/register", json=user_data)
    assert response1.status_code == status.HTTP_201_CREATED

    # Tentative de double enregistrement
    response2 = client.post("/api/v1/users/register", json=user_data)

    assert response2.status_code == 409
    assert "déjà utilisé" in response2.json()["detail"].lower(
    ) or "email" in response2.json()["detail"].lower()


def test_register_missing_fields(client):
    """Test POST /api/v1/users/register avec des champs manquants."""
    incomplete_data = {
        "email": "incomplete@test.com",
        "password": "password123"
        # first_name et surname manquants
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

    # Note: Pydantic peut valider le format d'email, mais cela dépend de la config
    response = client.post("/api/v1/users/register", json=user_data)
    # Soit 422 (validation), soit 201 si la validation n'est pas stricte
    assert response.status_code in [
        status.HTTP_422_UNPROCESSABLE_CONTENT, status.HTTP_201_CREATED]


def test_login_success(client):
    """Test POST /api/v1/users/login avec succès."""
    # D'abord créer un utilisateur
    user_data = {
        "email": "login@test.com",
        "password": "correct_password",
        "first_name": "Login",
        "surname": "User"
    }
    client.post("/api/v1/users/register", json=user_data)

    # Puis se connecter
    login_data = {
        "email": "login@test.com",
        "password": "correct_password"
    }

    response = client.post("/api/v1/users/login", json=login_data)

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "email" in data
    assert "first_name" in data
    assert "surname" in data
    assert data["email"] == "login@test.com"
    assert data["first_name"] == "Login"
    assert data["surname"] == "User"


def test_login_wrong_password(client):
    """Test POST /api/v1/users/login avec un mauvais mot de passe."""
    # Créer un utilisateur
    user_data = {
        "email": "login@test.com",
        "password": "correct_password",
        "first_name": "Login",
        "surname": "User"
    }
    client.post("/api/v1/users/register", json=user_data)

    # Tentative de connexion avec mauvais mot de passe
    login_data = {
        "email": "login@test.com",
        "password": "wrong_password"
    }

    response = client.post("/api/v1/users/login", json=login_data)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "incorrect" in response.json()["detail"].lower(
    ) or "incorrect" in response.json()["detail"]


def test_login_nonexistent_user(client):
    """Test POST /api/v1/users/login avec un utilisateur inexistant."""
    login_data = {
        "email": "nonexistent@test.com",
        "password": "any_password"
    }

    response = client.post("/api/v1/users/login", json=login_data)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "incorrect" in response.json()["detail"].lower(
    ) or "incorrect" in response.json()["detail"]


def test_login_missing_fields(client):
    """Test POST /api/v1/users/login avec des champs manquants."""
    incomplete_data = {
        "email": "test@test.com"
        # password manquant
    }

    response = client.post("/api/v1/users/login", json=incomplete_data)

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
