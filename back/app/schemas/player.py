
from pydantic import BaseModel, ConfigDict, field_validator

VALID_CATEGORIES = {"Mixte", "+35", "+50", "Open masculin", "Open féminin"}


class PlayerBase(BaseModel):
    name: str
    level: int
    sex: str
    position: str
    category_names: list[str]

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        if len(v) > 100:
            raise ValueError("Le nom ne doit pas dépasser 100 caractères")
        if not v.strip():
            raise ValueError("Le nom est obligatoire")
        return v.strip()

    @field_validator("level")
    @classmethod
    def validate_level(cls, v):
        if v < 1 or v > 4:
            raise ValueError("Le niveau doit être compris entre 1 et 4")
        return v

    @field_validator("sex")
    @classmethod
    def validate_sex(cls, v):
        if v not in ("H", "F"):
            raise ValueError("Le sexe doit être 'H' ou 'F'")
        return v

    @field_validator("position")
    @classmethod
    def validate_position(cls, v):
        if v not in ("Ailier", "Meneur"):
            raise ValueError("Le poste doit être 'Ailier' ou 'Meneur'")
        return v

    @field_validator("category_names")
    @classmethod
    def validate_category_names(cls, v):
        if not v:
            raise ValueError("Au moins une catégorie est requise")
        for name in v:
            if name not in VALID_CATEGORIES:
                raise ValueError(f"Catégorie invalide : {name}")
        return v


class ApiCreatePlayer(PlayerBase):
    pass


class ApiUpdatePlayer(PlayerBase):
    pass


class ApiReturnPlayer(BaseModel):
    id: int
    name: str
    level: int
    sex: str
    position: str
    team_name: str
    category_names: list[str]

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def model_validate(cls, obj, **kwargs):
        data = {
            "id": obj.id,
            "name": obj.name,
            "level": obj.level,
            "sex": obj.sex,
            "position": obj.position,
            "team_name": obj.team.name if obj.team else None,
            "category_names": [c.name for c in obj.categories] if obj.categories else [],
        }
        return cls(**data)
