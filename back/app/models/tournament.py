from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.session import Base


class Tournament(Base):
    __tablename__ = "rt_tournament"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category_id = Column(
        Integer,
        ForeignKey("rt_category.id", ondelete="RESTRICT"),
        nullable=False,
    )
    team_id = Column(
        Integer,
        ForeignKey("rt_team.id", ondelete="CASCADE"),
        nullable=False,
    )

    category = relationship("Category", lazy="joined")
    team = relationship("Team", back_populates="tournaments")
    players = relationship(
        "Player", secondary="rt_tournament_player", lazy="joined"
    )
