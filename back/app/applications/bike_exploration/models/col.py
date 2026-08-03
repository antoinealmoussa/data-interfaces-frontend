from sqlalchemy import BigInteger, Column, DateTime, Float, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.applications.bike_exploration.models.activity_col import ActivityCol
from app.db.session import Base


class Col(Base):
    __tablename__ = "be_col"

    id = Column(Integer, primary_key=True, index=True)
    osm_id = Column(BigInteger, nullable=True)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation = Column(Integer, nullable=True)
    country = Column(String(100), nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())

    activities = relationship("Activity", secondary=ActivityCol.__table__, back_populates="cols")
