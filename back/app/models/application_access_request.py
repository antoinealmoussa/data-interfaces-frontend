from typing import TYPE_CHECKING, List

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, relationship

from app.db.session import Base
from app.models.application_access_request_application import (
    application_access_request_application,
)

if TYPE_CHECKING:
    from app.models.application import Application
    from app.models.user import User


class ApplicationAccessRequest(Base):
    __tablename__ = "application_access_request"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_stravoska.id"), nullable=False)
    status = Column(String, nullable=False, default="pending")
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    decided_by = Column(Integer, ForeignKey("user_stravoska.id"), nullable=True)
    decided_at = Column(DateTime, nullable=True)

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id])
    applications: Mapped[List["Application"]] = relationship(
        "Application",
        secondary=application_access_request_application,
    )
