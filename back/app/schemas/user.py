from pydantic import BaseModel, ConfigDict
from app.models.user import User
from typing import List
from app.schemas.application import ApiReturnApplication


class UserBase(BaseModel):
    """
    Champs communs partagés entre la création et la lecture.
    """
    email: str
    first_name: str
    surname: str


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