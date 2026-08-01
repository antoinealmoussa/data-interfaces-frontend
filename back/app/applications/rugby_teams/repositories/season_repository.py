from app.applications.rugby_teams.models.season import Season
from app.applications.rugby_teams.schemas.season import ApiReturnSeason
from app.db.repository import BaseRepository


class SeasonRepository(BaseRepository[Season, ApiReturnSeason]):
    model_class = Season
    return_schema = ApiReturnSeason

    def get_by_name(self, name: str) -> Season | None:
        return self.db.query(Season).filter(Season.name == name).first()
