import pytest

from app.applications.rugby_teams.services.category_service import (
    get_category_by_name,
    resolve_categories,
)


def test_get_category_by_name_found(db_session):
    category = get_category_by_name(db_session, "Mixte")
    assert category is not None
    assert category.name == "Mixte"


def test_get_category_by_name_not_found(db_session):
    category = get_category_by_name(db_session, "Inexistante")
    assert category is None


def test_resolve_categories_all_found(db_session):
    categories = resolve_categories(db_session, ["Mixte", "+35"])
    assert len(categories) == 2
    names = {c.name for c in categories}
    assert names == {"Mixte", "+35"}


def test_resolve_categories_single(db_session):
    categories = resolve_categories(db_session, ["Open masculin"])
    assert len(categories) == 1
    assert categories[0].name == "Open masculin"


def test_resolve_categories_missing_raises(db_session):
    with pytest.raises(ValueError) as exc:
        resolve_categories(db_session, ["Mixte", "Inexistante"])
    assert "Inexistante" in str(exc.value)


def test_resolve_categories_empty_list(db_session):
    categories = resolve_categories(db_session, [])
    assert categories == []
