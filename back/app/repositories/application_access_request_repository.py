from datetime import datetime, timezone
from typing import List

from app.db.repository import BaseRepository
from app.models.application import Application
from app.models.application_access_request import ApplicationAccessRequest
from app.models.user import User
from app.schemas.application_access_request import ApiReturnAccessRequest


class ApplicationAccessRequestRepository(
    BaseRepository[ApplicationAccessRequest, ApiReturnAccessRequest]
):
    model_class = ApplicationAccessRequest
    return_schema = ApiReturnAccessRequest

    def create_request(
        self, user: User, applications: List[Application]
    ) -> ApplicationAccessRequest:
        request = ApplicationAccessRequest(user_id=user.id)
        request.applications = applications
        self.db.add(request)
        self.db.commit()
        self.db.refresh(request)
        return request

    def get_pending(self) -> List[ApplicationAccessRequest]:
        return (
            self.db.query(ApplicationAccessRequest)
            .filter(ApplicationAccessRequest.status == "pending")
            .order_by(ApplicationAccessRequest.created_at.asc())
            .all()
        )

    def set_applications(
        self, request: ApplicationAccessRequest, applications: List[Application]
    ) -> None:
        request.applications = applications
        self.db.commit()
        self.db.refresh(request)

    def approve(
        self,
        request: ApplicationAccessRequest,
        applications: List[Application],
        admin: User,
    ) -> ApplicationAccessRequest:
        request.applications = applications
        for app in applications:
            if app not in request.user.applications:
                request.user.applications.append(app)
        request.status = "approved"
        request.decided_by = admin.id
        request.decided_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(request)
        return request
