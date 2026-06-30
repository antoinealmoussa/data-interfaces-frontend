from sqlalchemy import Column, ForeignKey, Integer, PrimaryKeyConstraint

from app.db.session import Base


class TeamSeason(Base):
    __tablename__ = "rt_team_season"

    team_id = Column(Integer, ForeignKey("rt_team.id", ondelete="CASCADE"), nullable=False)
    season_id = Column(Integer, ForeignKey("rt_season.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("team_id", "season_id"),
    )
