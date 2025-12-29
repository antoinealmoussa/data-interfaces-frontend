from sqlalchemy import Column, Integer, String
from src.api_authentication.database import Base


class User(Base):
    __tablename__ = "user_stravoska"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String)
    surname = Column(String)
    email = Column(String)
    password = Column(String)
