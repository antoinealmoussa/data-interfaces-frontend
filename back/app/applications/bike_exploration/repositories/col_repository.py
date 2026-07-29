from app.applications.bike_exploration.models.col import Col
from app.applications.bike_exploration.schemas.col import ApiReturnCol
from app.db.repository import BaseRepository


class ColRepository(BaseRepository[Col, ApiReturnCol]):
    model_class = Col
    return_schema = ApiReturnCol

    def get_within_bbox(
        self,
        min_lat: float,
        max_lat: float,
        min_lon: float,
        max_lon: float,
    ) -> list[Col]:
        return (
            self.db.query(self.model_class)
            .filter(
                self.model_class.latitude >= min_lat,
                self.model_class.latitude <= max_lat,
                self.model_class.longitude >= min_lon,
                self.model_class.longitude <= max_lon,
            )
            .all()
        )

    def get_conquered_by_user(self, user_id: int) -> list[Col]:
        from app.applications.bike_exploration.models.activity import Activity
        from app.applications.bike_exploration.models.activity_col import ActivityCol

        return (
            self.db.query(self.model_class)
            .join(ActivityCol, ActivityCol.col_id == self.model_class.id)
            .join(Activity, Activity.id == ActivityCol.activity_id)
            .where(Activity.user_id == user_id)
            .distinct()
            .order_by(self.model_class.name)
            .all()
        )
