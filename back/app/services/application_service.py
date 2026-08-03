from sqlalchemy.orm import Session

from app.models.application import Application
from app.repositories.application_repository import ApplicationRepository


def list_applications(db: Session) -> list[Application]:
    return ApplicationRepository(db).get_many()
