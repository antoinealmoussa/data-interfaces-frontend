from app.applications.race_preparation.models.track_point import TrackPoint
from app.applications.race_preparation.schemas.track_point import ApiReturnTrackPoint
from app.db.repository import BaseRepository


class TrackPointRepository(BaseRepository[TrackPoint, ApiReturnTrackPoint]):
    model_class = TrackPoint
    return_schema = ApiReturnTrackPoint

    def get_by_race(self, race_id: int) -> list[TrackPoint]:
        return (
            self.db.query(TrackPoint)
            .filter(TrackPoint.race_id == race_id)
            .order_by(TrackPoint.point_index)
            .all()
        )

    def create_many(self, race_id: int, track_points: list[dict]) -> int:
        objects = [
            self.model_class(
                race_id=race_id,
                lat=tp["lat"],
                lon=tp["lon"],
                elevation=tp["elevation"],
                distance=tp["distance"],
                point_index=i,
            )
            for i, tp in enumerate(track_points)
        ]
        self.db.add_all(objects)
        self.db.commit()
        return len(objects)

    def delete_by_race(self, race_id: int) -> int:
        deleted = (
            self.db.query(TrackPoint)
            .filter(TrackPoint.race_id == race_id)
            .delete(synchronize_session="fetch")
        )
        self.db.commit()
        return deleted
