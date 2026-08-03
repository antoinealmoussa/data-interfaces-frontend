from sqlalchemy.orm import selectinload

from app.applications.rugby_teams.models.category import Category
from app.applications.rugby_teams.models.season import Season
from app.applications.rugby_teams.models.team import Team
from app.applications.rugby_teams.models.team_season import TeamSeason
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

    def create_team(
        self,
        name: str,
        user_id: int,
        seasons: list[Season],
        categories: list[Category],
    ) -> Team:
        db_team = Team(
            name=name,
            user_id=user_id,
            seasons=seasons,
            categories=categories,
        )
        self.db.add(db_team)
        self.db.commit()
        self.db.refresh(db_team)
        return db_team

    def delete_team(self, team: Team) -> None:
        seasons = list(team.seasons)

        self.db.delete(team)
        self.db.flush()

        for season in seasons:
            remaining = self._count_team_seasons(season.id)
            if remaining == 0:
                self.db.delete(season)

        self.db.commit()

    def _count_team_seasons(self, season_id: int) -> int:
        return (
            self.db.query(TeamSeason)
            .filter(TeamSeason.season_id == season_id)
            .count()
        )
