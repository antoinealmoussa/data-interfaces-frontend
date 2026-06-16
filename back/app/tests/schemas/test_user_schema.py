import pytest
from pydantic import ValidationError

from app.schemas.user import ApiCreateUser, ApiReturnUser, ApiUpdateUser, Token


class TestApiCreateUser:
    def test_valid(self):
        user = ApiCreateUser(
            email="test@example.com",
            password="password123",
            first_name="John",
            surname="Doe",
        )
        assert user.email == "test@example.com"
        assert user.first_name == "John"
        assert user.surname == "Doe"
        assert user.password == "password123"

    def test_email_lowercased(self):
        user = ApiCreateUser(
            email="Test@Example.COM",
            password="pass",
            first_name="John",
            surname="Doe",
        )
        assert user.email == "test@example.com"

    def test_invalid_email(self):
        with pytest.raises(ValidationError):
            ApiCreateUser(
                email="not-an-email",
                password="pass",
                first_name="John",
                surname="Doe",
            )

    def test_missing_password(self):
        with pytest.raises(ValidationError):
            ApiCreateUser(
                email="test@example.com",
                first_name="John",
                surname="Doe",
            )


class TestApiReturnUser:
    def test_valid(self):
        user = ApiReturnUser(
            id=1, email="test@example.com", first_name="John", surname="Doe"
        )
        assert user.id == 1
        assert user.email == "test@example.com"
        assert user.first_name == "John"
        assert user.surname == "Doe"

    def test_password_not_included(self):
        data = {"id": 1, "email": "test@example.com", "first_name": "John", "surname": "Doe"}
        assert "password" not in data


class TestApiUpdateUser:
    def test_partial_first_name(self):
        user = ApiUpdateUser(first_name="NewName")
        assert user.first_name == "NewName"
        assert user.surname is None
        assert user.email is None

    def test_partial_surname(self):
        user = ApiUpdateUser(surname="NewSurname")
        assert user.surname == "NewSurname"

    def test_partial_email(self):
        user = ApiUpdateUser(email="new@example.com")
        assert user.email == "new@example.com"

    def test_email_lowercased(self):
        user = ApiUpdateUser(email="NEW@Example.COM")
        assert user.email == "new@example.com"

    def test_invalid_email(self):
        with pytest.raises(ValidationError):
            ApiUpdateUser(email="invalid")

    def test_empty_update(self):
        user = ApiUpdateUser()
        assert user.first_name is None
        assert user.surname is None
        assert user.email is None


class TestToken:
    def test_valid(self):
        token = Token(access_token="abc123", token_type="bearer")
        assert token.access_token == "abc123"
        assert token.token_type == "bearer"
