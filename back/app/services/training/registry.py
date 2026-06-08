from app.schemas.training import AlgorithmInfo
from .algorithms.random import RandomAlgorithm
from .algorithms.balanced import BalancedAlgorithm
from .algorithms.base import BaseDistributionAlgorithm

_algorithms: list[BaseDistributionAlgorithm] = [
    RandomAlgorithm(),
    BalancedAlgorithm(),
]


def get_algorithm(algorithm_id: str) -> BaseDistributionAlgorithm | None:
    return next((a for a in _algorithms if a.id == algorithm_id), None)


def get_all_algorithms() -> list[AlgorithmInfo]:
    return [AlgorithmInfo(id=a.id, label=a.label) for a in _algorithms]
