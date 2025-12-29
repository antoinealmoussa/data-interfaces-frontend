from pydantic import BaseModel


class ApiReturnUser(BaseModel):
    first_name: str
    surname: str
    email: str
