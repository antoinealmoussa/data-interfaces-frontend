from sqlalchemy import Column, Integer, String
from src.api_name_origin_probabilities.database import Base


class Country(Base):
    __tablename__ = "country"

    id = Column(Integer, primary_key=True, index=True)
    alias = Column(String)
    name = Column(String)
