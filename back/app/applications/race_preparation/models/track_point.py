from sqlalchemy import Column, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.db.session import Base


class TrackPoint(Base):
    __tablename__ = "rp_track_point"

    id = Column(Integer, primary_key=True, index=True)
    race_id = Column(Integer, ForeignKey("rp_race.id", ondelete="CASCADE"), nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    elevation = Column(Float, nullable=False)
    distance = Column(Float, nullable=False)
    point_index = Column(Integer, nullable=False)

    race = relationship("Race", back_populates="track_points")
