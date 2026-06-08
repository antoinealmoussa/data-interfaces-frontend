from sqlalchemy import Column, Integer, ForeignKey, PrimaryKeyConstraint
from app.db.session import Base


class PlayerCategory(Base):
    __tablename__ = "player_category"

    player_id = Column(Integer, ForeignKey("player.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("category.id", ondelete="RESTRICT"), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("player_id", "category_id"),
    )
