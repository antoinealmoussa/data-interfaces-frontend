from app.applications.race_preparation.repositories.race_repository import (
    RaceRepository,
)
from app.applications.race_preparation.repositories.section_repository import (
    SectionRepository,
)


def _make_section(order_index: int, start_distance: float) -> dict:
    return {
        "name": None,
        "section_type": "climb",
        "start_distance": start_distance,
        "end_distance": start_distance + 1000,
        "distance": 1000,
        "elevation_gain": 100,
        "elevation_loss": 0,
        "average_gradient": 10,
        "start_elevation": 1000,
        "end_elevation": 1100,
        "pace": None,
        "actual_pace": None,
        "order_index": order_index,
    }


def test_race_sections_returned_ordered_by_order_index(db_session):
    race_repo = RaceRepository(db_session)
    race = race_repo.create_race(
        user_id=1,
        name="Test race",
        file_name="test.gpx",
        gpx_file_path="/tmp/test.gpx",
        total_distance=4000,
        total_elevation_gain=400,
        total_elevation_loss=0,
    )
    SectionRepository(db_session).replace_all(
        race.id,
        [
            _make_section(2, 2000),
            _make_section(0, 0),
            _make_section(3, 3000),
            _make_section(1, 1000),
        ],
    )

    loaded = race_repo.get_by_user_and_id(user_id=1, race_id=race.id)
    assert [s.order_index for s in loaded.sections] == [0, 1, 2, 3]
    assert [s.start_distance for s in loaded.sections] == [0, 1000, 2000, 3000]


def test_race_sections_order_survives_pace_update(db_session):
    """Après un update d'allure, l'ordre par order_index est conservé."""
    race_repo = RaceRepository(db_session)
    race = race_repo.create_race(
        user_id=1,
        name="Test race 2",
        file_name="test2.gpx",
        gpx_file_path="/tmp/test2.gpx",
        total_distance=4000,
        total_elevation_gain=400,
        total_elevation_loss=0,
    )
    section_repo = SectionRepository(db_session)
    section_repo.replace_all(
        race.id,
        [
            _make_section(0, 0),
            _make_section(1, 1000),
            _make_section(2, 2000),
            _make_section(3, 3000),
        ],
    )

    sections = section_repo.get_by_race(race.id)
    updates = [
        {"section_id": sections[0].id, "pace": 8.0},
        {"section_id": sections[1].id, "pace": 5.0},
    ]
    section_repo.apply_updates(sections, updates)

    loaded = race_repo.get_by_user_and_id(user_id=1, race_id=race.id)
    resulting = [
        (s.order_index, s.start_distance, s.pace) for s in loaded.sections
    ]
    assert resulting == [
        (0, 0, 8.0),
        (1, 1000, 5.0),
        (2, 2000, None),
        (3, 3000, None),
    ]
