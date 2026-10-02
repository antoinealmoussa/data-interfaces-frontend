from sqlalchemy import Column, ForeignKey, Integer, PrimaryKeyConstraint

from app.db.session import Base


class PlayerTeamSeason(Base):
    """Roster saisonnier : un joueur appartient à une équipe pour une saison."""

    __tablename__ = "rt_player_team_season"

    player_id = Column(Integer, ForeignKey("rt_player.id", ondelete="CASCADE"), nullable=False)
    team_id = Column(Integer, ForeignKey("rt_team.id", ondelete="CASCADE"), nullable=False)
    season_id = Column(Integer, ForeignKey("rt_season.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("player_id", "team_id", "season_id"),
    )
