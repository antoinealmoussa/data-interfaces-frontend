from sqlalchemy.orm import Session

from app.applications.bike_exploration.models.activity_col import ActivityCol


class ActivityColRepository:
    def __init__(self, db: Session):
        self.db = db

    def link_cols(self, activity_id: int, col_crossings: dict[int, int]) -> None:
        if not col_crossings:
            return

        for col_id, n in col_crossings.items():
            existing = (
                self.db.query(ActivityCol)
                .filter(
                    ActivityCol.activity_id == activity_id,
                    ActivityCol.col_id == col_id,
                )
                .first()
            )
            if existing:
                existing.crossings += n
            else:
                self.db.add(ActivityCol(
                    activity_id=activity_id,
                    col_id=col_id,
                    crossings=n,
                ))
        self.db.commit()

    def get_col_ids_for_activity(self, activity_id: int) -> list[int]:
        return [
            row[0]
            for row in self.db.query(ActivityCol.col_id)
            .filter(ActivityCol.activity_id == activity_id)
            .all()
        ]
