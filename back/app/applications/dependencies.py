from fastapi import Depends, HTTPException, status

from app.core.token import get_current_active_user
from app.models.user import User


class require_app_access:
    """Vérifie que l'utilisateur connecté a accès à l'application.
    Usage : Depends(require_app_access("rugby-teams"))
    """

    def __init__(self, app_name: str):
        self.app_name = app_name

    def __call__(self, current_user: User = Depends(get_current_active_user)) -> User:
        if not any(app.name == self.app_name for app in current_user.applications):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Accès non autorisé à l'application '{self.app_name}'",
            )
        return current_user
