import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.token import create_access_token
from app.db.session import Base, get_db
from app.main import app
from app.models.application import Application
from app.models.category import Category
from app.schemas.user import ApiCreateUser
from app.services import user_service
from app.utils.validators import TEAM_CATEGORIES


SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine)


def seed_categories(db):
    for name in TEAM_CATEGORIES:
        db.add(Category(name=name))
    db.commit()


def seed_applications(db):
    app = Application(name="rugby-teams", pretty_name="Rugby Teams")
    db.add(app)
    db.commit()
    return app


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        seed_categories(db)
        seed_applications(db)
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        yield db_session

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
    user = user_service.create_user(db_session, user_in=user)
    app = db_session.query(Application).filter(Application.name == "rugby-teams").first()
    if app and app not in user.applications:
        user.applications.append(app)
        db_session.commit()
    return user


@pytest.fixture(scope="function")
def authenticated_client(client, test_user):
    token = create_access_token(
        data={"sub": test_user.email, "token_version": test_user.token_version}
    )
    client.cookies.set("access_token", token)
    return client
