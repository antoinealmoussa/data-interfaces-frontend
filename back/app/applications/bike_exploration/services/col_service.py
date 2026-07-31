from sqlalchemy.orm import Session

from app.applications.bike_exploration.models.col import Col
from app.applications.bike_exploration.repositories.col_repository import ColRepository


def get_cols(db: Session) -> list[Col]:
    return ColRepository(db).get_many(limit=500)


def get_conquered_cols(db: Session, user_id: int) -> list[tuple[Col, int, int]]:
    return ColRepository(db).get_conquered_by_user(user_id)
