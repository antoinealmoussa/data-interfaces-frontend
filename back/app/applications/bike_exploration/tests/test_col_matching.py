from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.applications.bike_exploration.models.activity import Activity
from app.applications.bike_exploration.models.col import Col
from app.applications.bike_exploration.services.col_matching_service import (
    _build_grid,
    count_col_crossings,
    match_activity_cols,
)
from app.applications.bike_exploration.services.fit_service import GpsPoint

COL_LAT = 44.326
COL_LON = 6.807
T0 = datetime(2026, 7, 1, 10, 0, 0)


def _seed_col(db: Session, name: str, lat: float, lon: float, elevation: int = 2000) -> Col:
    col = Col(name=name, latitude=lat, longitude=lon, elevation=elevation, country="FR")
    db.add(col)
    db.commit()
    db.refresh(col)
    return col


def _seed_activity(db: Session, user_id: int = 1, name: str = "Test") -> Activity:
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


def _get_crossings(db: Session, activity_id: int, col_id: int) -> int:
    from app.applications.bike_exploration.models.activity_col import ActivityCol

    row = (
        db.query(ActivityCol)
        .filter(
            ActivityCol.activity_id == activity_id,
            ActivityCol.col_id == col_id,
        )
        .first()
    )
    return row.crossings if row else 0


def _in_point(elevation: float, t: datetime) -> GpsPoint:
    return GpsPoint(
        lat=COL_LAT + 0.0008,
        lon=COL_LON + 0.0008,
        elevation=elevation,
        timestamp=t,
    )


def _out_point(elevation: float, t: datetime) -> GpsPoint:
    return GpsPoint(
        lat=COL_LAT + 0.004,
        lon=COL_LON + 0.004,
        elevation=elevation,
        timestamp=t,
    )


class TestMatchActivityCols:
    def test_nearby_col_is_matched(self, db_session: Session) -> None:
        col = _seed_col(db_session, "Col Bonette", lat=COL_LAT, lon=COL_LON)
        activity = _seed_activity(db_session)

        points = [
            _in_point(2000, T0),
            _in_point(2005, T0 + timedelta(seconds=30)),
        ]
        match_activity_cols(db_session, activity, points)
        db_session.refresh(activity)

        matched_ids = {c.id for c in activity.cols}
        assert col.id in matched_ids
        assert _get_crossings(db_session, activity.id, col.id) == 1

    def test_far_col_not_matched(self, db_session: Session) -> None:
        _seed_col(db_session, "Col lointain", lat=48.0, lon=2.0)
        activity = _seed_activity(db_session)

        points = [_out_point(2000, T0)]
        match_activity_cols(db_session, activity, points)
        db_session.refresh(activity)

        assert len(activity.cols) == 0

    def test_empty_points_no_crash(self, db_session: Session) -> None:
        _seed_col(db_session, "Col Bonette", lat=COL_LAT, lon=COL_LON)
        activity = _seed_activity(db_session)

        match_activity_cols(db_session, activity, [])
        db_session.refresh(activity)
        assert len(activity.cols) == 0

    def test_same_col_not_duplicated(self, db_session: Session) -> None:
        col = _seed_col(db_session, "Col Bonette", lat=COL_LAT, lon=COL_LON)
        activity = _seed_activity(db_session)

        points = [
            _in_point(1980, T0),
            _in_point(2005, T0 + timedelta(seconds=30)),
            _in_point(2002, T0 + timedelta(seconds=60)),
        ]
        match_activity_cols(db_session, activity, points)
        db_session.refresh(activity)

        matched_ids = [c.id for c in activity.cols]
        assert matched_ids.count(col.id) == 1
        assert _get_crossings(db_session, activity.id, col.id) == 1


class TestCountColCrossings:
    def _grid(self, elevation: int | None = 2000) -> dict[str, list[Col]]:
        col = Col(id=1, name="Col Test", latitude=COL_LAT, longitude=COL_LON, elevation=elevation)
        return _build_grid([col])

    def test_single_pass(self) -> None:
        points = [
            _in_point(2000, T0),
            _in_point(2005, T0 + timedelta(seconds=30)),
            _out_point(1800, T0 + timedelta(minutes=10)),
        ]
        assert count_col_crossings(points, self._grid()) == {1: 1}

    def test_double_pass_more_than_one_hour(self) -> None:
        points = [
            _in_point(2000, T0),
            _out_point(1500, T0 + timedelta(minutes=10)),
            _out_point(1200, T0 + timedelta(hours=1)),
            _in_point(1990, T0 + timedelta(hours=1, minutes=30)),
            _out_point(1500, T0 + timedelta(hours=1, minutes=40)),
        ]
        assert count_col_crossings(points, self._grid()) == {1: 2}

    def test_quick_reentry_not_counted(self) -> None:
        points = [
            _in_point(2000, T0),
            _out_point(1500, T0 + timedelta(minutes=10)),
            _in_point(1990, T0 + timedelta(minutes=30)),
            _out_point(1500, T0 + timedelta(minutes=40)),
        ]
        assert count_col_crossings(points, self._grid()) == {1: 1}

    def test_pass_below_summit_not_counted(self) -> None:
        points = [
            _in_point(1700, T0),
            _in_point(1700, T0 + timedelta(seconds=30)),
            _out_point(1500, T0 + timedelta(minutes=10)),
        ]
        assert count_col_crossings(points, self._grid()) == {}

    def test_col_without_elevation_ignores_altitude_criterion(self) -> None:
        points = [
            _in_point(1000, T0),
            _out_point(900, T0 + timedelta(minutes=10)),
        ]
        assert count_col_crossings(points, self._grid(elevation=None)) == {1: 1}

    def test_missing_timestamps_ignore_time_criterion(self) -> None:
        points = [
            GpsPoint(lat=COL_LAT + 0.0008, lon=COL_LON + 0.0008, elevation=2000, timestamp=None),
            GpsPoint(lat=COL_LAT + 0.004, lon=COL_LON + 0.004, elevation=1500, timestamp=None),
            GpsPoint(lat=COL_LAT + 0.0008, lon=COL_LON + 0.0008, elevation=1990, timestamp=None),
            GpsPoint(lat=COL_LAT + 0.004, lon=COL_LON + 0.004, elevation=1500, timestamp=None),
        ]
        assert count_col_crossings(points, self._grid()) == {1: 2}
