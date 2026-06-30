from app.applications.rugby_teams.schemas.training import (
    AlgorithmInfo,
    DistributeInput,
    DistributeOutput,
    PlayerInfo,
    TrainingTeam,
)


class TestPlayerInfo:
    def test_valid(self):
        player = PlayerInfo(id=1, name="Jean", level=2, sex="H", position="Ailier")
        assert player.id == 1
        assert player.name == "Jean"
        assert player.level == 2
        assert player.sex == "H"
        assert player.position == "Ailier"


class TestDistributeInput:
    def test_valid(self):
        input_data = DistributeInput(
            player_ids=[1, 2, 3],
            team_count=2,
            algorithm="balanced",
        )
        assert input_data.player_ids == [1, 2, 3]
        assert input_data.team_count == 2
        assert input_data.algorithm == "balanced"


class TestTrainingTeam:
    def test_valid(self):
        team = TrainingTeam(
            id=1,
            name="Équipe 1",
            players=[
                PlayerInfo(id=1, name="Jean", level=2, sex="H", position="Ailier"),
            ],
        )
        assert team.id == 1
        assert team.name == "Équipe 1"
        assert len(team.players) == 1


class TestDistributeOutput:
    def test_valid(self):
        output = DistributeOutput(
            teams=[
                TrainingTeam(id=1, name="Équipe 1", players=[]),
                TrainingTeam(id=2, name="Équipe 2", players=[]),
            ]
        )
        assert len(output.teams) == 2


class TestAlgorithmInfo:
    def test_valid(self):
        info = AlgorithmInfo(id="random", label="Aléatoire")
        assert info.id == "random"
        assert info.label == "Aléatoire"
