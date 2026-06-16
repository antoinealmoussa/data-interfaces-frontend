from abc import ABC, abstractmethod

from app.schemas.training import DistributeInput, DistributeOutput


class BaseDistributionAlgorithm(ABC):
    @property
    @abstractmethod
    def id(self) -> str: ...

    @property
    @abstractmethod
    def label(self) -> str: ...

    @abstractmethod
    def distribute(self, input: DistributeInput, players: list) -> DistributeOutput: ...
