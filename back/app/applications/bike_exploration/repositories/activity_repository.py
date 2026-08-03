
from app.applications.bike_exploration.models.activity import Activity
from app.applications.bike_exploration.schemas.activity import ApiReturnActivity
from app.applications.bike_exploration.services.activity_parser import ActivityData
from app.db.repository import BaseRepository


class ActivityRepository(BaseRepository[Activity, ApiReturnActivity]):
    model_class = Activity
    return_schema = ApiReturnActivity

    def get_by_user_and_strava_id(self, user_id: int, strava_activity_id: int) -> Activity | None:
        return (
            self.db.query(Activity)
            .filter(Activity.user_id == user_id, Activity.strava_activity_id == strava_activity_id)
            .first()
        )

    def create_from_act_data(self, user_id: int, act_data: ActivityData) -> Activity:
        activity = self.model_class(
            strava_activity_id=act_data.strava_activity_id,
            name=act_data.name,
            start_date=act_data.start_date,
            user_id=user_id,
        )
        self.db.add(activity)
        self.db.commit()
        self.db.refresh(activity)
        return activity

    def count_by_user(self, user_id: int) -> int:
        return (
            self.db.query(Activity)
            .filter(Activity.user_id == user_id)
            .count()
        )

    def delete_by_user(self, user_id: int) -> int:
        deleted = (
            self.db.query(Activity)
            .filter(Activity.user_id == user_id)
            .delete(synchronize_session="fetch")
        )
        self.db.commit()
        return deleted
