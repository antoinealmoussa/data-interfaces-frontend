from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.applications.bike_exploration.schemas.col import ApiReturnCol


class ActivityBase(BaseModel):
    strava_activity_id: int
    name: str
    start_date: datetime


class ApiReturnActivity(ActivityBase):
    id: int
    cols: list[ApiReturnCol] = []
    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def model_validate(cls, obj, **kwargs):
        data = {
            "id": obj.id,
            "strava_activity_id": obj.strava_activity_id,
            "name": obj.name,
            "start_date": obj.start_date,
            "cols": [ApiReturnCol.model_validate(c) for c in obj.cols],
        }
        return cls(**data)
