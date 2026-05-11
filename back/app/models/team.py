from sqlalchemy import Column, Integer, String, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from app.db.session import Base

class Team(Base):
    __tablename__ = "team"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)  # Max 50 caractères
    categories = Column(ARRAY(String), nullable=False)  # Ex: ["Mixte", "+35"]
    user_id = Column(Integer, ForeignKey("user_stravoska.id"))
    
    user = relationship("User", back_populates="teams")
    seasons = relationship("Season", secondary="team_season", back_populates="teams")
