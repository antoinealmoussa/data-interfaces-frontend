from sqlalchemy.orm import selectinload

from app.applications.rugby_teams.models.season import Season
from app.applications.rugby_teams.models.team import Team
from app.applications.rugby_teams.schemas.team import ApiReturnTeam
from app.db.repository import BaseRepository


class TeamRepository(BaseRepository[Team, ApiReturnTeam]):
    model_class = Team
    return_schema = ApiReturnTeam
    _default_eager = ("categories", "seasons")

    def find_by_name(self, name: str) -> Team | None:
        return self.db.query(Team).filter(Team.name == name).first()

    def get_by_season(self, season_id: int, user_id: int) -> list[Team]:
        return (
            self.db.query(Team)
            .options(
                selectinload(Team.categories),
                selectinload(Team.seasons),
            )
            .join(Team.seasons)
            .filter(Season.id == season_id, Team.user_id == user_id)
            .all()
        )

    def count_by_user(self, user_id: int) -> int:
        return self.db.query(Team).filter(Team.user_id == user_id).count()
