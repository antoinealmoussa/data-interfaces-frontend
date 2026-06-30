from app.applications.rugby_teams.services.training.algorithms.balanced import BalancedAlgorithm
from app.applications.rugby_teams.services.training.algorithms.random import RandomAlgorithm
from app.applications.rugby_teams.services.training.registry import (
    get_algorithm,
    get_all_algorithms,
)


def test_get_algorithm_random():
    algo = get_algorithm("random")
    assert algo is not None
    assert isinstance(algo, RandomAlgorithm)
    assert algo.id == "random"
    assert algo.label == "Aléatoire"


def test_get_algorithm_balanced():
    algo = get_algorithm("balanced")
    assert algo is not None
    assert isinstance(algo, BalancedAlgorithm)
    assert algo.id == "balanced"
    assert algo.label == "Équilibré (niveau + sexe)"


def test_get_algorithm_unknown():
    algo = get_algorithm("nonexistent")
    assert algo is None


def test_get_all_algorithms():
    algorithms = get_all_algorithms()
    assert len(algorithms) == 2
    algo_ids = {a.id for a in algorithms}
    assert algo_ids == {"random", "balanced"}
    algo_labels = {a.label for a in algorithms}
    assert "Aléatoire" in algo_labels
    assert "Équilibré (niveau + sexe)" in algo_labels
