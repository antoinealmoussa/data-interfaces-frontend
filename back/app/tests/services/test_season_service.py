from app.models.season import Season
from app.services.season_service import (
    create_season_if_not_exists,
    get_season_by_id,
    get_season_by_name,
    get_seasons,
)


def test_get_seasons_empty(db_session):
    seasons = get_seasons(db_session)
    assert seasons == []


def test_get_seasons_with_data(db_session):
    s1 = Season(name="2024-2025")
    s2 = Season(name="2025-2026")
    db_session.add_all([s1, s2])
    db_session.commit()

    seasons = get_seasons(db_session)
    assert len(seasons) == 2


def test_get_seasons_with_limit(db_session):
    for name in ["2023-2024", "2024-2025", "2025-2026"]:
        db_session.add(Season(name=name))
    db_session.commit()

    seasons = get_seasons(db_session, limit=2)
    assert len(seasons) == 2


def test_get_seasons_with_skip(db_session):
    for name in ["2023-2024", "2024-2025", "2025-2026"]:
        db_session.add(Season(name=name))
    db_session.commit()

    seasons = get_seasons(db_session, skip=1)
    assert len(seasons) == 2


def test_get_season_by_id_found(db_session):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    result = get_season_by_id(db_session, season.id)
    assert result is not None
    assert result.name == "2025-2026"


def test_get_season_by_id_not_found(db_session):
    result = get_season_by_id(db_session, 999)
    assert result is None


def test_get_season_by_name_found(db_session):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    result = get_season_by_name(db_session, "2025-2026")
    assert result is not None
    assert result.id == season.id


def test_get_season_by_name_not_found(db_session):
    result = get_season_by_name(db_session, "9999-9999")
    assert result is None


def test_create_season_if_not_exists_new(db_session):
    season = create_season_if_not_exists(db_session, "2025-2026")
    assert season is not None
    assert season.name == "2025-2026"
    assert season.id is not None


def test_create_season_if_not_exists_existing(db_session):
    season1 = create_season_if_not_exists(db_session, "2025-2026")
    season2 = create_season_if_not_exists(db_session, "2025-2026")
    assert season1.id == season2.id
    assert season1.name == season2.name


def test_create_season_if_not_exists_multiple(db_session):
    s1 = create_season_if_not_exists(db_session, "2024-2025")
    s2 = create_season_if_not_exists(db_session, "2025-2026")
    assert s1.id != s2.id
