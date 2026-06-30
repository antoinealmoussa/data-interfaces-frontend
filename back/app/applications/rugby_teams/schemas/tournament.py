from typing import List

from pydantic import BaseModel, ConfigDict


class TournamentBase(BaseModel):
    name: str
    category_name: str
    player_names: List[str]


class ApiCreateTournament(TournamentBase):
    """Données requises pour la création d'un tournoi (identique à TournamentBase aujourd'hui,
    mais séparé pour permettre une divergence future Create vs Update)."""
    pass


class ApiUpdateTournament(TournamentBase):
    """Données requises pour la modification d'un tournoi (identique à TournamentBase aujourd'hui,
    mais séparé pour permettre une divergence future Create vs Update)."""
    pass


class ApiReturnTournament(BaseModel):
    id: int
    name: str
    category_name: str
    player_names: List[str]

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def model_validate(cls, obj, **kwargs):
        data = {
            "id": obj.id,
            "name": obj.name,
            "category_name": obj.category.name if obj.category else None,
            "player_names": [p.name for p in obj.players] if obj.players else [],
        }
        return cls(**data)
