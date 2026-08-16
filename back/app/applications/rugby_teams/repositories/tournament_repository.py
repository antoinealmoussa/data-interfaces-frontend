from app.applications.rugby_teams.models.player import Player
from app.applications.rugby_teams.models.tournament import Tournament
from app.applications.rugby_teams.schemas.tournament import ApiReturnTournament
from app.db.repository import BaseRepository


class TournamentRepository(BaseRepository[Tournament, ApiReturnTournament]):
    model_class = Tournament
    return_schema = ApiReturnTournament

    def get_by_team(
        self, team_id: int, skip: int = 0, limit: int = 100
    ) -> list[Tournament]:
        return self.get_many(team_id=team_id, skip=skip, limit=limit)

    def update_tournament(
        self,
        tournament: Tournament,
        name: str,
        category_id: int,
        players: list[Player],
    ) -> Tournament:
        tournament.name = name
        tournament.category_id = category_id
        tournament.players = players
        self.db.commit()
        self.db.refresh(tournament)
        return tournament

    def delete_tournament(self, tournament: Tournament) -> None:
        self.db.delete(tournament)
        self.db.commit()
