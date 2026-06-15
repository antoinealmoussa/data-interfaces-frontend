from app.db.repository import BaseRepository
from app.models.tournament import Tournament
from app.schemas.tournament import ApiReturnTournament


class TournamentRepository(BaseRepository[Tournament, ApiReturnTournament]):
    model_class = Tournament
    return_schema = ApiReturnTournament

    def get_by_team(
        self, team_id: int, skip: int = 0, limit: int = 100
    ) -> list[Tournament]:
        return self.get_many(team_id=team_id, skip=skip, limit=limit)
