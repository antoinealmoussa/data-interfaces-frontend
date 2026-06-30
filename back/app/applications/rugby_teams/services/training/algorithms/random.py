import random

from app.schemas.training import DistributeInput, DistributeOutput, PlayerInfo, TrainingTeam

from .base import BaseDistributionAlgorithm


class RandomAlgorithm(BaseDistributionAlgorithm):
    @property
    def id(self) -> str:
        return "random"

    @property
    def label(self) -> str:
        return "Aléatoire"

    def distribute(self, input: DistributeInput, players: list) -> DistributeOutput:
        shuffled = list(players)
        random.shuffle(shuffled)
        teams = [
            TrainingTeam(id=i + 1, name=f"Équipe {i + 1}", players=[])
            for i in range(input.team_count)
        ]
        for index, player in enumerate(shuffled):
            teams[index % input.team_count].players.append(
                PlayerInfo.model_validate(player)
            )
        return DistributeOutput(teams=teams)
