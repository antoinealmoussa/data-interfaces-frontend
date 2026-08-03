from pydantic import BaseModel


class ApiReturnRole(BaseModel):
    id: int
    name: str
