from app.db.repository import BaseRepository
from app.models.player import Player
from app.schemas.player import ApiReturnPlayer


class PlayerRepository(BaseRepository[Player, ApiReturnPlayer]):
    model_class = Player
    return_schema = ApiReturnPlayer

    def get_by_team(
        self, team_id: int, skip: int = 0, limit: int = 100
    ) -> list[Player]:
        return self.get_many(team_id=team_id, skip=skip, limit=limit)
