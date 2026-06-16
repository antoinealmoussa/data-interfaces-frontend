from typing import List

from pydantic import BaseModel, ConfigDict, field_validator

from app.models.user import User
from app.schemas.application import ApiReturnApplication


class UserBase(BaseModel):
    """
    Champs communs partagés entre la création et la lecture.
    """
    email: str
    first_name: str
    surname: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        import re
        pattern = r'^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
        if not re.match(pattern, v, re.IGNORECASE):
            raise ValueError("Format d'email invalide")
        return v.lower()


class ApiCreateUser(UserBase):
    """
    Données requises pour l'inscription.
    Le mot de passe n'est présent qu'ici.
    """
    password: str
    def to_model(self, hashed_pw: str):
        return User(
            email=self.email,
            first_name=self.first_name,
            surname=self.surname,
            password=hashed_pw
        )


class ApiReturnUser(UserBase):
    """
    Données renvoyées par l'API au Frontend.
    On hérite de UserBase pour avoir email, first_name et surname.
    On ajoute l'ID mais on ne renvoie JAMAIS le mot de passe.
    """
    id: int
    model_config = ConfigDict(from_attributes=True)


class ApiReturnUserWithApplications(BaseModel):
    user: ApiReturnUser
    applications: List[ApiReturnApplication]
    model_config = ConfigDict(from_attributes=True)



class Token(BaseModel):
    access_token: str
    token_type: str


class ApiUpdateUser(BaseModel):
    first_name: str | None = None
    surname: str | None = None
    email: str | None = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v):
        if v is None:
            return v
        import re
        pattern = r'^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
        if not re.match(pattern, v, re.IGNORECASE):
            raise ValueError("Format d'email invalide")
        return v.lower()
