from typing import List

from pydantic import BaseModel, ConfigDict, field_validator

from app.schemas.season import ApiReturnSeason
from app.utils.validators import TEAM_CATEGORIES, validate_season_format


class TeamBase(BaseModel):
    name: str
    categories: List[str]
    user_id: int

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if len(v) > 50:
            raise ValueError("Le nom de l'équipe ne doit pas dépasser 50 caractères")
        if not v.strip():
            raise ValueError("Le nom de l'équipe est obligatoire")
        return v

    @field_validator("categories")
    @classmethod
    def validate_categories(cls, v):
        if not v or len(v) == 0:
            raise ValueError("Veuillez sélectionner au moins une catégorie.")
        for cat in v:
            if cat not in TEAM_CATEGORIES:
                raise ValueError(f"Catégorie invalide: {cat}")
        return v


class ApiCreateTeam(TeamBase):
    season_name: str

    @field_validator("season_name")
    @classmethod
    def validate_season_name(cls, v):
        if not v or v.strip() == "":
            raise ValueError("Veuillez sélectionner une saison.")
        validate_season_format(v)
        return v


class ApiReturnTeam(TeamBase):
    id: int
    seasons: List[ApiReturnSeason]
    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def model_validate(cls, obj, **kwargs):
        data = {
            "id": obj.id,
            "name": obj.name,
            "categories": [c.name for c in obj.categories],
            "user_id": obj.user_id,
            "seasons": [ApiReturnSeason.model_validate(s) for s in obj.seasons],
        }
        return cls(**data)
