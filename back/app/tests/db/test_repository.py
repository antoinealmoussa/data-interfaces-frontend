from pydantic import BaseModel, ConfigDict

from app.db.repository import BaseRepository
from app.models.application import Application


class ApplicationCreate(BaseModel):
    name: str
    pretty_name: str
    description: str
    unknown_field: str = "ignored"


class ApplicationUpdate(BaseModel):
    name: str | None = None
    pretty_name: str | None = None
    description: str | None = None


class ApplicationRepoReturn(BaseModel):
    id: int
    name: str
    pretty_name: str
    description: str

    model_config = ConfigDict(from_attributes=True)


class ApplicationRepository(BaseRepository[Application, ApplicationRepoReturn]):
    model_class = Application
    return_schema = ApplicationRepoReturn


def test_get_by_id_found(db_session):
    repo = ApplicationRepository(db_session)
    app = Application(name="test-app", pretty_name="Test App", description="Test description")
    db_session.add(app)
    db_session.commit()
    db_session.refresh(app)

    result = repo.get_by_id(app.id)

    assert result is not None
    assert result.id == app.id
    assert result.name == "test-app"


def test_get_by_id_not_found(db_session):
    repo = ApplicationRepository(db_session)

    assert repo.get_by_id(99999) is None


def test_get_many_with_filters(db_session):
    repo = ApplicationRepository(db_session)
    for i in range(3):
        db_session.add(Application(name=f"app-{i}", pretty_name=f"App {i}", description=f"Description {i}"))
    db_session.commit()

    results = repo.get_many(pretty_name="App 1")

    assert len(results) == 1
    assert results[0].name == "app-1"


def test_get_many_with_pagination(db_session):
    repo = ApplicationRepository(db_session)
    for i in range(3):
        db_session.add(Application(name=f"app-{i}", pretty_name=f"App {i}", description=f"Description {i}"))
    db_session.commit()

    all_apps = repo.get_many()
    results = repo.get_many(skip=1, limit=2)

    assert len(results) == 2
    assert [a.name for a in results] == [a.name for a in all_apps[1:3]]


def test_create_filters_unknown_fields(db_session):
    repo = ApplicationRepository(db_session)

    result = repo.create(
        ApplicationCreate(
            name="created-app",
            pretty_name="Created App",
            description="Created description",
        )
    )

    assert isinstance(result, ApplicationRepoReturn)
    assert result.name == "created-app"
    assert result.pretty_name == "Created App"
    assert result.description == "Created description"

    db_obj = (
        db_session.query(Application)
        .filter(Application.name == "created-app")
        .first()
    )
    assert db_obj is not None


def test_update_partial(db_session):
    repo = ApplicationRepository(db_session)
    app = Application(name="orig", pretty_name="Original", description="Original description")
    db_session.add(app)
    db_session.commit()
    db_session.refresh(app)

    result = repo.update(app.id, ApplicationUpdate(pretty_name="Updated"))

    assert result is not None
    assert result.name == "orig"
    assert result.pretty_name == "Updated"


def test_update_not_found(db_session):
    repo = ApplicationRepository(db_session)

    assert repo.update(99999, ApplicationUpdate(name="x")) is None


def test_delete_existing(db_session):
    repo = ApplicationRepository(db_session)
    app = Application(name="del-me", pretty_name="Delete Me", description="Delete description")
    db_session.add(app)
    db_session.commit()
    db_session.refresh(app)

    assert repo.delete(app.id) is True

    db_obj = db_session.query(Application).filter(Application.id == app.id).first()
    assert db_obj is None


def test_delete_not_found(db_session):
    repo = ApplicationRepository(db_session)

    assert repo.delete(99999) is False
