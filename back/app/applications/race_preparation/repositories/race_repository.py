from sqlalchemy.orm import selectinload

from app.applications.race_preparation.models.race import Race
from app.applications.race_preparation.schemas.race import ApiReturnRace
from app.db.repository import BaseRepository


class RaceRepository(BaseRepository[Race, ApiReturnRace]):
    model_class = Race
    return_schema = ApiReturnRace
    _default_eager = ("sections",)

    def get_by_user(self, user_id: int) -> list[Race]:
        return (
            self.db.query(Race)
            .filter(Race.user_id == user_id)
            .order_by(Race.created_at.desc())
            .all()
        )

    def get_by_user_and_id(self, user_id: int, race_id: int) -> Race | None:
        return (
            self.db.query(Race)
            .options(selectinload(Race.sections))
            .filter(Race.user_id == user_id, Race.id == race_id)
            .first()
        )

    def delete_by_id(self, race_id: int) -> bool:
        db_obj = self.get_by_id(race_id)
        if not db_obj:
            return False
        self.db.delete(db_obj)
        self.db.commit()
        return True
