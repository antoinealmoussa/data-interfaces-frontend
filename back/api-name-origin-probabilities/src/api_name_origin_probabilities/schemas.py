from pydantic import BaseModel


class CountryInfo(BaseModel):
    country_id: str
    probability: float


class ApiNationalize(BaseModel):
    count: int
    name: str
    country: list[CountryInfo]


class CountryProbability(BaseModel):
    x: str
    y: float


class ApiNameOriginProbabilities(BaseModel):
    probabilities: list[CountryProbability]
