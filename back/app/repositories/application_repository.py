from app.db.repository import BaseRepository
from app.models.application import Application
from app.schemas.application import ApiReturnApplication


class ApplicationRepository(BaseRepository[Application, ApiReturnApplication]):
    model_class = Application
    return_schema = ApiReturnApplication
