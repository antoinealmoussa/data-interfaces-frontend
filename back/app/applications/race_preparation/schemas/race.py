from pydantic import BaseModel, ConfigDict, field_validator


class RaceBase(BaseModel):
    name: str
    file_name: str
    total_distance: float
    total_elevation_gain: float
    total_elevation_loss: float

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Le nom de la course est obligatoire")
        return v.strip()


class ApiReturnRace(RaceBase):
    id: int
    user_id: int
    gpx_file_path: str
    sections: list["ApiReturnSection"] = []
    model_config = ConfigDict(from_attributes=True)


class ApiReturnRaceWithTrackPoints(ApiReturnRace):
    track_points: list["ApiReturnTrackPoint"] = []


from app.applications.race_preparation.schemas.section import ApiReturnSection  # noqa: E402
from app.applications.race_preparation.schemas.track_point import ApiReturnTrackPoint  # noqa: E402

ApiReturnRace.model_rebuild()
