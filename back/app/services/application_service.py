from sqlalchemy.orm import Session

from app.models.application import Application
from app.repositories.application_repository import ApplicationRepository
from app.repositories.user_repository import UserRepository
from app.utils.exceptions import ApplicationNotFoundError, UserNotFoundError


def list_applications(db: Session) -> list[Application]:
    return ApplicationRepository(db).get_many()


def assign_application(db: Session, user_id: int, app_id: int) -> None:
    user = UserRepository(db).get_by_id(user_id)
    if not user:
        raise UserNotFoundError(user_id)

    app = ApplicationRepository(db).get_by_id(app_id)
    if not app:
        raise ApplicationNotFoundError(app_id)

    UserRepository(db).add_application(user, app)


def remove_application(db: Session, user_id: int, app_id: int) -> None:
    user = UserRepository(db).get_by_id(user_id)
    if not user:
        raise UserNotFoundError(user_id)

    app = ApplicationRepository(db).get_by_id(app_id)
    if not app:
        raise ApplicationNotFoundError(app_id)

    UserRepository(db).remove_application(user, app)
