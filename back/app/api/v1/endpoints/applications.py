from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.token import get_current_active_user
from app.db.session import get_db
from app.models.application import Application
from app.models.user import User
from app.schemas.application import ApiReturnApplication

router = APIRouter()


@router.get("", response_model=list[ApiReturnApplication])
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> list[ApiReturnApplication]:
    """Liste toutes les applications disponibles."""
    return db.query(Application).all()


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
    """Assigne une application à un utilisateur."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé",
        )
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application non trouvée",
        )
    if app not in user.applications:
        user.applications.append(app)
        db.commit()


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
    """Retire l'accès d'un utilisateur à une application."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé",
        )
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application non trouvée",
        )
    if app in user.applications:
        user.applications.remove(app)
        db.commit()
