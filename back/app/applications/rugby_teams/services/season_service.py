from sqlalchemy.orm import Session

from app.applications.rugby_teams.models.season import Season
from app.applications.rugby_teams.repositories.season_repository import SeasonRepository


def get_seasons(db: Session, skip: int = 0, limit: int = 100) -> list[Season]:
    return SeasonRepository(db).get_many(skip=skip, limit=limit)


def get_season_by_id(db: Session, season_id: int) -> Season | None:
    return SeasonRepository(db).get_by_id(season_id)


def get_season_by_name(db: Session, name: str) -> Season | None:
    return SeasonRepository(db).get_by_name(name)


def create_season_if_not_exists(db: Session, season_name: str) -> Season:
    """Crée la saison si elle n'existe pas encore. Retourne l'objet Season."""
    existing = get_season_by_name(db, season_name)
    if existing:
        return existing

    return SeasonRepository(db).create_season(season_name)
