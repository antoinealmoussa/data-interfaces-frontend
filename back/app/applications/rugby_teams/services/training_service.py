from sqlalchemy.orm import Session

from app.applications.rugby_teams.repositories.player_repository import PlayerRepository
from app.applications.rugby_teams.schemas.training import (
    AlgorithmInfo,
    DistributeInput,
    DistributeOutput,
)
from app.applications.rugby_teams.services.team_service import get_owned_team
from app.applications.rugby_teams.services.training.registry import (
    get_algorithm,
    get_all_algorithms,
)
from app.utils.exceptions import InvalidRequestError, MissingPlayersError


def list_algorithms(db: Session, team_name: str, user_id: int) -> list[AlgorithmInfo]:
    get_owned_team(db, team_name, user_id)
    return get_all_algorithms()


def distribute(
    db: Session,
    team_name: str,
    user_id: int,
    input: DistributeInput,
) -> DistributeOutput:
    team = get_owned_team(db, team_name, user_id)

    algorithm = get_algorithm(input.algorithm)
    if not algorithm:
        raise InvalidRequestError(f"Algorithme '{input.algorithm}' inconnu")

    players = PlayerRepository(db).get_by_ids_in_team(input.player_ids, team.id)

    if len(players) != len(input.player_ids):
        found_ids = {p.id for p in players}
        missing = set(input.player_ids) - found_ids
        raise MissingPlayersError(missing)

    if len(players) < 2:
        raise InvalidRequestError("Au moins 2 joueurs sont requis")

    if input.team_count > len(players):
        raise InvalidRequestError(
            "Le nombre d'équipes ne peut pas dépasser le nombre de joueurs"
        )

    return algorithm.distribute(input, players)
