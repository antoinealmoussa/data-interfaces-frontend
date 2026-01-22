from sqlalchemy import Column, Integer, ForeignKey, Table
from app.db.session import Base

user_application = Table(
    "user_application",
    Base.metadata,
    Column("user_id", Integer, ForeignKey(
        "user_stravoska.id"), primary_key=True),
    Column("application_id", Integer, ForeignKey(
        "application.id"), primary_key=True)
)
