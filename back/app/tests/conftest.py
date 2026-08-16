import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.applications.rugby_teams.models.category import Category
from app.core.jwt import create_access_token
from app.db.session import Base, get_db
from app.main import app
from app.models.application import Application
from app.models.role import Role
from app.repositories.role_repository import RoleRepository
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
    for name, pretty_name, description in (
        ("bike-exploration", "Exploration vélo", "Sorties et explorations vélo"),
        ("rugby-teams", "Rugby Teams", "Gestion d'équipes de rugby"),
        ("race-preparation", "Préparation de course", "Préparation aux courses"),
    ):
        db.add(Application(name=name, pretty_name=pretty_name, description=description))
    db.commit()
    return db.query(Application).filter(Application.name == "rugby-teams").first()


def seed_roles(db):
    db.add(Role(name="admin"))
    db.add(Role(name="normal_user"))
    db.commit()


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    try:
        seed_categories(db)
        seed_applications(db)
        seed_roles(db)
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
def admin_user(db_session):
    user = ApiCreateUser(
        email="admin@test.com",
        password="testpassword",
        first_name="Admin",
        surname="User",
    )
    user = user_service.create_user(db_session, user_in=user)
    admin_role = RoleRepository(db_session).get_by_name("admin")
    user.role_id = admin_role.id
    db_session.commit()
    return user


@pytest.fixture(scope="function")
def authenticated_client(client, test_user):
    token = create_access_token(
        data={"sub": test_user.email, "token_version": test_user.token_version}
    )
    client.cookies.set("access_token", token)
    return client


@pytest.fixture(scope="function")
def admin_client(client, admin_user):
    token = create_access_token(
        data={"sub": admin_user.email, "token_version": admin_user.token_version}
    )
    client.cookies.set("access_token", token)
    return client


@pytest.fixture(scope="function", autouse=True)
def reset_rate_limiters():
    from app.api.v1.endpoints.search_topic import search_limiter
    from app.api.v1.endpoints.users import rate_limiter, register_limiter

    for limiter in (rate_limiter, register_limiter, search_limiter):
        limiter.attempts.clear()
    yield
    for limiter in (rate_limiter, register_limiter, search_limiter):
        limiter.attempts.clear()
