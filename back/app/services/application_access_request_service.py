from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.application_access_request import ApplicationAccessRequest
from app.models.user import User
from app.repositories.application_access_request_repository import (
    ApplicationAccessRequestRepository,
)
from app.repositories.application_repository import ApplicationRepository
from app.utils.exceptions import (
    AccessRequestNotFoundError,
    ApplicationNotFoundError,
    InvalidRequestError,
)


def resolve_applications(db: Session, app_names: list[str]) -> list[Application]:
    apps = []
    for name in app_names:
        app = ApplicationRepository(db).get_by_name(name)
        if not app:
            raise ApplicationNotFoundError(app_name=name)
        apps.append(app)
    return apps


def create_request(
    db: Session, user: User, applications: list[Application]
) -> ApplicationAccessRequest | None:
    if not applications:
        return None
    return ApplicationAccessRequestRepository(db).create_request(user, applications)


def list_pending_requests(db: Session) -> list[ApplicationAccessRequest]:
    return ApplicationAccessRequestRepository(db).get_pending()


def approve_request(
    db: Session, request_id: int, app_names: list[str], admin: User
) -> ApplicationAccessRequest:
    repository = ApplicationAccessRequestRepository(db)
    request = repository.get_by_id(request_id)
    if not request:
        raise AccessRequestNotFoundError(request_id)
    if request.status != "pending":
        raise InvalidRequestError("Cette demande a déjà été traitée")
    applications = resolve_applications(db, app_names)
    return repository.approve(request, applications, admin)
