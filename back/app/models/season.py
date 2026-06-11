from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.db.session import Base


class Season(Base):
    __tablename__ = "season"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(9), nullable=False, unique=True)  # Format AAAA-AAAA (9 chars max), unique

    teams = relationship("Team", secondary="team_season", back_populates="seasons")
