from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.session import Base


class Section(Base):
    __tablename__ = "rp_section"

    id = Column(Integer, primary_key=True, index=True)
    race_id = Column(Integer, ForeignKey("rp_race.id", ondelete="CASCADE"), nullable=False)
    order_index = Column(Integer, nullable=False)
    name = Column(String(255), nullable=True)
    section_type = Column(String(15), nullable=False)
    start_distance = Column(Float, nullable=False)
    end_distance = Column(Float, nullable=False)
    distance = Column(Float, nullable=False)
    elevation_gain = Column(Float, nullable=False)
    elevation_loss = Column(Float, nullable=False)
    average_gradient = Column(Float, nullable=False)
    start_elevation = Column(Float, nullable=False)
    end_elevation = Column(Float, nullable=False)
    pace = Column(Float, nullable=True)
    actual_pace = Column(Float, nullable=True)

    race = relationship("Race", back_populates="sections")
