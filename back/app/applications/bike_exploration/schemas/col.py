from pydantic import BaseModel, ConfigDict, field_validator


class ColBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    elevation: int | None = None
    country: str | None = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError("Le nom du col est obligatoire")
        return v.strip()

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v):
        if v < -90 or v > 90:
            raise ValueError("La latitude doit être comprise entre -90 et 90")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v):
        if v < -180 or v > 180:
            raise ValueError("La longitude doit être comprise entre -180 et 180")
        return v


class ApiReturnCol(ColBase):
    id: int
    osm_id: int | None = None
    model_config = ConfigDict(from_attributes=True)
