from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class Team(Base):
    __tablename__ = "team"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)  # Max 50 caractères
    user_id = Column(Integer, ForeignKey("user_stravoska.id"))
    
    user = relationship("User", back_populates="teams")
    seasons = relationship("Season", secondary="team_season", back_populates="teams")
    categories = relationship("Category", secondary="team_category", back_populates="teams")
    players = relationship("Player", back_populates="team", lazy="dynamic")
