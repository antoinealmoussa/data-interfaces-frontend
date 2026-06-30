from sqlalchemy import Column, ForeignKey, Integer, PrimaryKeyConstraint

from app.db.session import Base


class TeamCategory(Base):
    __tablename__ = "rt_team_category"

    team_id = Column(Integer, ForeignKey("rt_team.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("rt_category.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("team_id", "category_id"),
    )
