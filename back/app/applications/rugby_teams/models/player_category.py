from sqlalchemy import Column, ForeignKey, Integer, PrimaryKeyConstraint

from app.db.session import Base


class PlayerCategory(Base):
    __tablename__ = "rt_player_category"

    player_id = Column(Integer, ForeignKey("rt_player.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("rt_category.id", ondelete="RESTRICT"), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("player_id", "category_id"),
    )
