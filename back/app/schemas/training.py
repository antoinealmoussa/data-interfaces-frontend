from pydantic import BaseModel, ConfigDict


class PlayerInfo(BaseModel):
    id: int
    name: str
    level: int
    sex: str
    position: str

    model_config = ConfigDict(from_attributes=True)


class DistributeInput(BaseModel):
    player_ids: list[int]
    team_count: int
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
