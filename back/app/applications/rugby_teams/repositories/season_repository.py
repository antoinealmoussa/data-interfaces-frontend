from app.applications.rugby_teams.models.season import Season
from app.applications.rugby_teams.schemas.season import ApiReturnSeason
from app.db.repository import BaseRepository


class SeasonRepository(BaseRepository[Season, ApiReturnSeason]):
    model_class = Season
    return_schema = ApiReturnSeason

    def get_by_name(self, name: str) -> Season | None:
        return self.db.query(Season).filter(Season.name == name).first()

    def create_season(self, name: str) -> Season:
        db_season = Season(name=name)
        self.db.add(db_season)
        self.db.commit()
        self.db.refresh(db_season)
        return db_season
