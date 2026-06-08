from sqlalchemy import Column, Integer, ForeignKey, PrimaryKeyConstraint
from app.db.session import Base


class TeamSeason(Base):
    __tablename__ = "team_season"

    team_id = Column(Integer, ForeignKey("team.id", ondelete="CASCADE"), nullable=False)
    season_id = Column(Integer, ForeignKey("season.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("team_id", "season_id"),
    )
