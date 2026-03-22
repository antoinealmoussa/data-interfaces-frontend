from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship, Mapped
from app.db.session import Base
from app.models.user_application import user_application
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User

class Application(Base):
    __tablename__ = "application"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    pretty_name = Column(String, nullable=False)

    users: Mapped[List["User"]] = relationship("User", secondary=user_application,
                         back_populates="applications")
