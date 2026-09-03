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

    def replace_all(self, race_id: int, rows: list[dict]) -> None:
        existing = self.get_by_race(race_id)
        for s in existing:
            self.db.delete(s)
        self.db.flush()

        for row in rows:
            self.db.add(
                self.model_class(race_id=race_id, **row)
            )
        self.db.commit()

    def apply_updates(self, sections: list[Section], updates: list[dict]) -> None:
        sections_by_id = {s.id: s for s in sections}
        for update in updates:
            section = sections_by_id.get(update["section_id"])
            if not section:
                continue
            if update.get("name") is not None:
                section.name = update["name"]
            if update.get("pace") is not None:
                section.pace = update["pace"]
            if update.get("actual_pace") is not None:
                section.actual_pace = update["actual_pace"]
        self.db.commit()
