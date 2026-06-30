from app.applications.rugby_teams.models.team import Team
from app.applications.rugby_teams.schemas.team import ApiReturnTeam
from app.db.repository import BaseRepository


class TeamRepository(BaseRepository[Team, ApiReturnTeam]):
    model_class = Team
    return_schema = ApiReturnTeam
