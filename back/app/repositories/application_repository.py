from app.db.repository import BaseRepository
from app.models.application import Application
from app.schemas.application import ApiReturnApplication


class ApplicationRepository(BaseRepository[Application, ApiReturnApplication]):
    model_class = Application
    return_schema = ApiReturnApplication

    def get_by_name(self, name: str) -> Application | None:
        return self.db.query(Application).filter(Application.name == name).first()
