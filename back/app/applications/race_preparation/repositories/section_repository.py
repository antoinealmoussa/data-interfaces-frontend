from app.applications.race_preparation.models.section import Section
from app.applications.race_preparation.schemas.section import ApiReturnSection
from app.db.repository import BaseRepository


class SectionRepository(BaseRepository[Section, ApiReturnSection]):
    model_class = Section
    return_schema = ApiReturnSection

    def get_by_race(self, race_id: int) -> list[Section]:
        return (
            self.db.query(Section)
            .filter(Section.race_id == race_id)
            .order_by(Section.order_index)
            .all()
        )

    def delete_by_race(self, race_id: int) -> int:
        deleted = (
            self.db.query(Section)
            .filter(Section.race_id == race_id)
            .delete(synchronize_session="fetch")
        )
        self.db.commit()
        return deleted
