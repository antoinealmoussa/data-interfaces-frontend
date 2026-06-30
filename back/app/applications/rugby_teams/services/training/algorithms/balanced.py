import random
from itertools import groupby

from app.applications.rugby_teams.schemas.training import (
    DistributeInput,
    DistributeOutput,
    PlayerInfo,
    TrainingTeam,
)

from .base import BaseDistributionAlgorithm


def _shuffle_within_levels(players, key_fn, reverse=False):
    sorted_players = sorted(players, key=key_fn, reverse=reverse)
    result = []
    for _, group in groupby(sorted_players, key=key_fn):
        group_list = list(group)
        random.shuffle(group_list)
        result.extend(group_list)
    return result


class BalancedAlgorithm(BaseDistributionAlgorithm):
    @property
    def id(self) -> str:
        return "balanced"

    @property
    def label(self) -> str:
        return "Équilibré (niveau + sexe)"

    def distribute(self, input: DistributeInput, players: list) -> DistributeOutput:
        team_count = input.team_count

        def level_key(p):
            return p.level if p.level is not None else 0

        women = _shuffle_within_levels(
            [p for p in players if p.sex == "F"],
            key_fn=level_key,
            reverse=True,
        )
        men = _shuffle_within_levels(
            [p for p in players if p.sex == "H"],
            key_fn=level_key,
        )

        team_lists: list[list] = [[] for _ in range(team_count)]

        # 1. Répartir les femmes en snake draft par niveau (fort → faible)
        idx = 0
        forward = True
        for player in women:
            team_lists[idx].append(player)
            if forward:
                idx += 1
                if idx >= team_count:
                    idx = team_count - 1
                    forward = False
            else:
                idx -= 1
                if idx < 0:
                    idx = 0
                    forward = True

        # 2. Répartir les hommes en round-robin par niveau (faible → fort)
        #    Les plus faibles d'abord pour éviter de les concentrer
        for i, player in enumerate(men):
            team_lists[i % team_count].append(player)

        teams = [
            TrainingTeam(
                id=i + 1,
                name=f"Équipe {i + 1}",
                players=[PlayerInfo.model_validate(p) for p in team_lists[i]],
            )
            for i in range(team_count)
        ]
        return DistributeOutput(teams=teams)
