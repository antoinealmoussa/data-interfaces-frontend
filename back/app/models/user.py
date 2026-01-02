from sqlalchemy import Column, Integer, String
from app.db.session import Base


class User(Base):
    __tablename__ = "user_stravoska"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
