from pydantic import BaseModel, ConfigDict, field_validator

from app.utils.validators import validate_season_format


class SeasonBase(BaseModel):
    name: str  # Format AAAA-AAAA

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        validate_season_format(v)
        return v

class ApiReturnSeason(SeasonBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
