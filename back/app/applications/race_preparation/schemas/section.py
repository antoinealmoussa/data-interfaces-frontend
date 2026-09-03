from pydantic import BaseModel, ConfigDict


class SectionBase(BaseModel):
    order_index: int
    name: str | None = None
    section_type: str
    start_distance: float
    end_distance: float
    distance: float
    elevation_gain: float
    elevation_loss: float
    average_gradient: float
    start_elevation: float
    end_elevation: float
    pace: float | None = None
    actual_pace: float | None = None


class ApiReturnSection(SectionBase):
    id: int
    race_id: int
    model_config = ConfigDict(from_attributes=True)


class ApiUpdateSection(BaseModel):
    section_id: int
    name: str | None = None
    pace: float | None = None
    actual_pace: float | None = None


class ApiUpdateSectionsRequest(BaseModel):
    sections: list[ApiUpdateSection]


class ApiSectionMarker(BaseModel):
    distance: float
    marker_type: str
    wait_time: float | None = None


class ApiCalculateSectionsRequest(BaseModel):
    markers: list[ApiSectionMarker]
