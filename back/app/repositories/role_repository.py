from app.db.repository import BaseRepository
from app.models.role import Role
from app.schemas.role import ApiReturnRole


class RoleRepository(BaseRepository[Role, ApiReturnRole]):
    model_class = Role
    return_schema = ApiReturnRole

    def get_by_name(self, name: str) -> Role | None:
        return self.db.query(Role).filter(Role.name == name).first()
