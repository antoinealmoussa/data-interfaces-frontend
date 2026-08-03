from pydantic import BaseModel, ConfigDict, Field


class PlayerInfo(BaseModel):
    id: int
    name: str
    level: int
    sex: str
    position: str

    model_config = ConfigDict(from_attributes=True)


class DistributeInput(BaseModel):
    player_ids: list[int]
    team_count: int = Field(..., ge=2, le=50)
    algorithm: str


class TrainingTeam(BaseModel):
    id: int
    name: str
    players: list[PlayerInfo]


class DistributeOutput(BaseModel):
    teams: list[TrainingTeam]


class AlgorithmInfo(BaseModel):
    id: str
    label: str
