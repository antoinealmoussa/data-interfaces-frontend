from sqlalchemy import CheckConstraint, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.session import Base


class Player(Base):
    __tablename__ = "rt_player"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    level = Column(Integer, nullable=False)
    sex = Column(String(1), nullable=False)
    position = Column(String(10), nullable=False)
    team_id = Column(Integer, ForeignKey("rt_team.id", ondelete="CASCADE"), nullable=False)

    categories = relationship("Category", secondary="rt_player_category", lazy="joined")
    team = relationship("Team", back_populates="players")

    __table_args__ = (
        CheckConstraint("level >= 1 AND level <= 4", name="ck_player_level"),
        CheckConstraint("sex IN ('H', 'F')", name="ck_player_sex"),
        CheckConstraint("position IN ('Ailier', 'Meneur')", name="ck_player_position"),
    )
