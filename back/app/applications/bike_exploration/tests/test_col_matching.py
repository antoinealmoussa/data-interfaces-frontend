from sqlalchemy.orm import Session

from app.applications.bike_exploration.models.activity import Activity
from app.applications.bike_exploration.models.col import Col
from app.applications.bike_exploration.services.col_matching_service import (
    match_activity_cols,
)


def _seed_col(db: Session, name: str, lat: float, lon: float, elevation: int = 2000) -> Col:
    col = Col(name=name, latitude=lat, longitude=lon, elevation=elevation, country="FR")
    db.add(col)
    db.commit()
    db.refresh(col)
    return col


def _seed_activity(db: Session, user_id: int = 1, name: str = "Test") -> Activity:
    from datetime import datetime

    activity = Activity(
        strava_activity_id=999999,
        user_id=user_id,
        name=name,
        start_date=datetime(2026, 7, 1),
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


class TestMatchActivityCols:
    def test_nearby_col_is_matched(self, db_session: Session) -> None:
        col = _seed_col(db_session, "Col Bonette", lat=44.326, lon=6.807)
        activity = _seed_activity(db_session)

        points = [(44.3265, 6.8075), (44.3268, 6.8078)]
        match_activity_cols(db_session, activity, points)
        db_session.refresh(activity)

        matched_ids = {c.id for c in activity.cols}
        assert col.id in matched_ids

    def test_far_col_not_matched(self, db_session: Session) -> None:
        _seed_col(db_session, "Col lointain", lat=48.0, lon=2.0)
        activity = _seed_activity(db_session)

        points = [(44.326, 6.807)]
        match_activity_cols(db_session, activity, points)
        db_session.refresh(activity)

        assert len(activity.cols) == 0

    def test_empty_points_no_crash(self, db_session: Session) -> None:
        _seed_col(db_session, "Col Bonette", lat=44.326, lon=6.807)
        activity = _seed_activity(db_session)

        match_activity_cols(db_session, activity, [])
        db_session.refresh(activity)
        assert len(activity.cols) == 0

    def test_same_col_not_duplicated(self, db_session: Session) -> None:
        col = _seed_col(db_session, "Col Bonette", lat=44.326, lon=6.807)
        activity = _seed_activity(db_session)

        points = [
            (44.3265, 6.8075),
            (44.3268, 6.8078),
            (44.3270, 6.8080),
        ]
        match_activity_cols(db_session, activity, points)
        db_session.refresh(activity)

        matched_ids = [c.id for c in activity.cols]
        assert matched_ids.count(col.id) == 1
