from sqlalchemy import Column, ForeignKey, Integer, Table

from app.db.session import Base

application_access_request_application = Table(
    "application_access_request_application",
    Base.metadata,
    Column("request_id", Integer, ForeignKey(
        "application_access_request.id"), primary_key=True),
    Column("application_id", Integer, ForeignKey(
        "application.id"), primary_key=True)
)
