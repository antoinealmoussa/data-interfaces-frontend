from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.session import Base


class Tournament(Base):
    __tablename__ = "tournament"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category_id = Column(
        Integer,
        ForeignKey("category.id", ondelete="RESTRICT"),
        nullable=False,
    )
    team_id = Column(
        Integer,
        ForeignKey("team.id", ondelete="CASCADE"),
        nullable=False,
    )

    category = relationship("Category", lazy="joined")
    team = relationship("Team", back_populates="tournaments")
    players = relationship(
        "Player", secondary="tournament_player", lazy="joined"
    )
