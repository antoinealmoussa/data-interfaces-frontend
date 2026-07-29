from sqlalchemy import BigInteger, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.applications.bike_exploration.models.activity_col import ActivityCol
from app.db.session import Base
from app.models.user import User


class Activity(Base):
    __tablename__ = "be_activity"

    id = Column(Integer, primary_key=True, index=True)
    strava_activity_id = Column(BigInteger, nullable=False)
    user_id = Column(Integer, ForeignKey("user_stravoska.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    start_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    user = relationship(User, backref="activities")
    cols = relationship("Col", secondary=ActivityCol.__table__, back_populates="activities")
