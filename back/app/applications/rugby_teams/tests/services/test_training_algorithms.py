
from app.applications.rugby_teams.schemas.training import DistributeInput, PlayerInfo
from app.applications.rugby_teams.services.training.algorithms.balanced import BalancedAlgorithm
from app.applications.rugby_teams.services.training.algorithms.random import RandomAlgorithm

PLAYERS = [
    PlayerInfo(id=1, name="Alice", level=4, sex="F", position="Ailier"),
    PlayerInfo(id=2, name="Bob", level=2, sex="H", position="Meneur"),
    PlayerInfo(id=3, name="Charlie", level=3, sex="H", position="Ailier"),
    PlayerInfo(id=4, name="Diana", level=1, sex="F", position="Meneur"),
    PlayerInfo(id=5, name="Eve", level=3, sex="F", position="Ailier"),
    PlayerInfo(id=6, name="Frank", level=4, sex="H", position="Meneur"),
]


class TestRandomAlgorithm:
    def test_distribute_returns_correct_team_count(self):
        algo = RandomAlgorithm()
        input_data = DistributeInput(
            player_ids=[1, 2, 3, 4, 5, 6],
            team_count=3,
            algorithm="random",
        )
        result = algo.distribute(input_data, PLAYERS)
        assert len(result.teams) == 3

    def test_distribute_all_players_assigned(self):
        algo = RandomAlgorithm()
        input_data = DistributeInput(
            player_ids=[1, 2, 3, 4, 5, 6],
            team_count=2,
            algorithm="random",
        )
        result = algo.distribute(input_data, PLAYERS)
        total = sum(len(t.players) for t in result.teams)
        assert total == 6

    def test_distribute_team_objects_have_correct_structure(self):
        algo = RandomAlgorithm()
        input_data = DistributeInput(
            player_ids=[1, 2],
            team_count=2,
            algorithm="random",
        )
        result = algo.distribute(input_data, PLAYERS[:2])
        for team in result.teams:
            assert team.id >= 1
            assert team.name.startswith("Équipe")
            assert isinstance(team.players, list)

    def test_distribute_single_team(self):
        algo = RandomAlgorithm()
        input_data = DistributeInput(
            player_ids=[1, 2, 3],
            team_count=1,
            algorithm="random",
        )
        result = algo.distribute(input_data, PLAYERS[:3])
        assert len(result.teams) == 1
        assert len(result.teams[0].players) == 3


class TestBalancedAlgorithm:
    def test_distribute_returns_correct_team_count(self):
        algo = BalancedAlgorithm()
        input_data = DistributeInput(
            player_ids=[1, 2, 3, 4],
            team_count=2,
            algorithm="balanced",
        )
        result = algo.distribute(input_data, PLAYERS[:4])
        assert len(result.teams) == 2

    def test_distribute_all_players_assigned(self):
        algo = BalancedAlgorithm()
        input_data = DistributeInput(
            player_ids=[1, 2, 3, 4, 5, 6],
            team_count=3,
            algorithm="balanced",
        )
        result = algo.distribute(input_data, PLAYERS)
        total = sum(len(t.players) for t in result.teams)
        assert total == 6

    def test_distribute_players_have_correct_attributes(self):
        algo = BalancedAlgorithm()
        input_data = DistributeInput(
            player_ids=[1, 2],
            team_count=2,
            algorithm="balanced",
        )
        result = algo.distribute(input_data, PLAYERS[:2])
        for team in result.teams:
            for p in team.players:
                assert p.name in ["Alice", "Bob"]

    def test_distribute_preserves_player_order_consistency(self):
        algo = BalancedAlgorithm()
        input_data = DistributeInput(
            player_ids=[1, 2, 3, 4, 5, 6],
            team_count=2,
            algorithm="balanced",
        )
        result1 = algo.distribute(input_data, PLAYERS)
        assert len(result1.teams) == 2

    def test_algorithm_properties(self):
        algo = BalancedAlgorithm()
        assert algo.id == "balanced"
        assert algo.label == "Équilibré (niveau + sexe)"
