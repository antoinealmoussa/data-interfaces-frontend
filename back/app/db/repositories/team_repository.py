from app.db.repository import BaseRepository
from app.models.team import Team
from app.schemas.team import ApiReturnTeam


class TeamRepository(BaseRepository[Team, ApiReturnTeam]):
    model_class = Team
    return_schema = ApiReturnTeam
