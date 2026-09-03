from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.session import Base


class Race(Base):
    __tablename__ = "rp_race"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user_stravoska.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    gpx_file_path = Column(String(512), nullable=False)
    total_distance = Column(Float, nullable=False)
    total_elevation_gain = Column(Float, nullable=False)
    total_elevation_loss = Column(Float, nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    sections = relationship(
        "Section",
        back_populates="race",
        cascade="all, delete-orphan",
        order_by="Section.order_index",
    )
    track_points = relationship("TrackPoint", back_populates="race", cascade="all, delete-orphan")
