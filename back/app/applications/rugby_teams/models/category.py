from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.session import Base


class Category(Base):
    __tablename__ = "rt_category"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)

    teams = relationship("Team", secondary="rt_team_category", back_populates="categories")
    players = relationship("Player", secondary="rt_player_category", back_populates="categories")
    tournaments = relationship("Tournament", back_populates="category")
