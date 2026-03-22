from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship, Mapped
from app.db.session import Base
from app.models.user_application import user_application
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.application import Application

class User(Base):
    __tablename__ = "user_stravoska"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    applications: Mapped[List["Application"]] = relationship(
        "Application", secondary=user_application, back_populates="users")
