from pydantic import BaseModel, ConfigDict


class TrackPointBase(BaseModel):
    lat: float
    lon: float
    elevation: float
    distance: float


class ApiReturnTrackPoint(TrackPointBase):
    id: int
    race_id: int
    point_index: int
    model_config = ConfigDict(from_attributes=True)
