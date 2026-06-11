from sqlalchemy import Column, ForeignKey, Integer, PrimaryKeyConstraint

from app.db.session import Base


class TournamentPlayer(Base):
    __tablename__ = "tournament_player"

    tournament_id = Column(
        Integer,
        ForeignKey("tournament.id", ondelete="CASCADE"),
        nullable=False,
    )
    player_id = Column(
        Integer,
        ForeignKey("player.id", ondelete="CASCADE"),
        nullable=False,
    )

    __table_args__ = (
        PrimaryKeyConstraint("tournament_id", "player_id"),
    )
