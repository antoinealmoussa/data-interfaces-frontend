from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.application import ApiReturnApplication
from app.services import application_service
from app.utils.exceptions import ForbiddenError

router = APIRouter()


@router.get("", response_model=list[ApiReturnApplication])
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> list[ApiReturnApplication]:
    """Liste toutes les applications disponibles."""
    return application_service.list_applications(db)


@router.get("/user", response_model=list[ApiReturnApplication])
def list_my_applications(
    current_user: User = Depends(get_current_active_user),
) -> list[ApiReturnApplication]:
    """Liste les applications auxquelles l'utilisateur connecté a accès."""
    return current_user.applications


@router.post(
    "/users/{user_id}/applications/{app_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def assign_application(
    user_id: int,
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> None:
    """Assigne une application à un utilisateur (self-service uniquement)."""
    if user_id != current_user.id:
        raise ForbiddenError()
    application_service.assign_application(db, user_id, app_id)


@router.delete(
    "/users/{user_id}/applications/{app_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_application(
    user_id: int,
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> None:
    """Retire l'accès d'un utilisateur à une application (self-service uniquement)."""
    if user_id != current_user.id:
        raise ForbiddenError()
    application_service.remove_application(db, user_id, app_id)
