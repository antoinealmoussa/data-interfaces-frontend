from sqlalchemy.orm import Session

from app.applications.rugby_teams.models.category import Category


def get_category_by_name(db: Session, name: str) -> Category | None:
    return db.query(Category).filter(Category.name == name).first()


def resolve_categories(db: Session, category_names: list[str]) -> list[Category]:
    """Résout une liste de noms de catégories en objets Category. Lève ValueError si manquantes."""
    categories = db.query(Category).filter(Category.name.in_(category_names)).all()
    if len(categories) != len(category_names):
        found = {c.name for c in categories}
        missing = [n for n in category_names if n not in found]
        raise ValueError(f"Catégories non trouvées : {', '.join(missing)}")
    return categories
