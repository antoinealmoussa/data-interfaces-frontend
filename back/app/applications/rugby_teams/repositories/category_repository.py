from app.applications.rugby_teams.models.category import Category
from app.applications.rugby_teams.schemas.category import ApiReturnCategory
from app.db.repository import BaseRepository


class CategoryRepository(BaseRepository[Category, ApiReturnCategory]):
    model_class = Category
    return_schema = ApiReturnCategory

    def get_by_name(self, name: str) -> Category | None:
        return self.db.query(Category).filter(Category.name == name).first()

    def get_by_names(self, names: list[str]) -> list[Category]:
        return self.db.query(Category).filter(Category.name.in_(names)).all()
