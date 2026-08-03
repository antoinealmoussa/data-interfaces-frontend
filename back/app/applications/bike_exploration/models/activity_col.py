from sqlalchemy import Column, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.sql import func

from app.db.session import Base


class ActivityCol(Base):
    __tablename__ = "be_activity_col"
    __table_args__ = (UniqueConstraint("activity_id", "col_id"),)

    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("be_activity.id", ondelete="CASCADE"), nullable=False)
    col_id = Column(Integer, ForeignKey("be_col.id", ondelete="CASCADE"), nullable=False)
    crossings = Column(Integer, nullable=False, default=1)
    matched_at = Column(DateTime, nullable=False, server_default=func.now())
