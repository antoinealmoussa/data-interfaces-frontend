from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict

from app.schemas.application import ApiReturnApplication


class ApiReturnAccessRequestUser(BaseModel):
    id: int
    email: str
    first_name: str
    surname: str
    model_config = ConfigDict(from_attributes=True)


class ApiReturnAccessRequest(BaseModel):
    id: int
    status: str
    created_at: datetime
    user: ApiReturnAccessRequestUser
    applications: List[ApiReturnApplication]
    model_config = ConfigDict(from_attributes=True)


class ApiUpdateAccessRequest(BaseModel):
    applications: List[str] = []
