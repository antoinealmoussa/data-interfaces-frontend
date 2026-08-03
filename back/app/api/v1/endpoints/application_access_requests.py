from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_admin
from app.db.session import get_db
from app.models.application_access_request import ApplicationAccessRequest
from app.models.user import User
from app.schemas.application_access_request import (
    ApiReturnAccessRequest,
    ApiUpdateAccessRequest,
)
from app.services import application_access_request_service

router = APIRouter()


@router.get("", response_model=list[ApiReturnAccessRequest])
def list_access_requests(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
) -> list[ApplicationAccessRequest]:
    """Liste les demandes d'accès en attente (admin uniquement)."""
    return application_access_request_service.list_pending_requests(db)


@router.put("/{request_id}", response_model=ApiReturnAccessRequest)
def approve_access_request(
    request_id: int,
    update_in: ApiUpdateAccessRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
) -> ApplicationAccessRequest:
    """Approuve une demande d'accès, en accordant les applications de la sélection finale."""
    return application_access_request_service.approve_request(
        db, request_id, update_in.applications, admin
    )
