from sqlalchemy import Column, Integer, ForeignKey, PrimaryKeyConstraint
from app.db.session import Base


class TeamCategory(Base):
    __tablename__ = "team_category"

    team_id = Column(Integer, ForeignKey("team.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("category.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("team_id", "category_id"),
    )
