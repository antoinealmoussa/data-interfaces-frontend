import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.session import Base, get_db
from app.main import app
from app.services import user_service
from app.schemas.user import ApiCreateUser
from app.core.token import create_access_token


SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(db_session):
    user = ApiCreateUser(
        email="testuser@test.com",
        password="testpassword",
        first_name="Test",
        surname="User"
    )
    return user_service.create_user(db_session, user_in=user)


@pytest.fixture(scope="function")
def authenticated_client(client, test_user):
    token = create_access_token(
        data={"sub": test_user.email, "token_version": test_user.token_version}
    )
    client.cookies.set("access_token", token)
    return client
