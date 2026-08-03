from app.applications.rugby_teams.models.player import Player
from app.applications.rugby_teams.schemas.player import ApiReturnPlayer
from app.db.repository import BaseRepository


class PlayerRepository(BaseRepository[Player, ApiReturnPlayer]):
    model_class = Player
    return_schema = ApiReturnPlayer
    _default_eager = ("team",)

    def get_by_team(
        self, team_id: int, skip: int = 0, limit: int = 100
    ) -> list[Player]:
        return self.get_many(team_id=team_id, skip=skip, limit=limit)

    def get_by_ids_in_team(self, player_ids: list[int], team_id: int) -> list[Player]:
        return (
            self.db.query(Player)
            .filter(Player.id.in_(player_ids), Player.team_id == team_id)
            .all()
        )

    def get_by_names_in_team(self, names: list[str], team_id: int) -> list[Player]:
        return (
            self.db.query(Player)
            .filter(Player.name.in_(names), Player.team_id == team_id)
            .all()
        )
