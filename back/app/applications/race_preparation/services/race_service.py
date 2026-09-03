import logging
import os

from sqlalchemy.orm import Session

from app.applications.race_preparation.models.race import Race
from app.applications.race_preparation.repositories.race_repository import (
    RaceRepository,
)
from app.applications.race_preparation.repositories.section_repository import (
    SectionRepository,
)
from app.applications.race_preparation.repositories.track_point_repository import (
    TrackPointRepository,
)
from app.applications.race_preparation.schemas.race import ApiReturnRace
from app.applications.race_preparation.schemas.section import (
    ApiCalculateSectionsRequest,
    ApiUpdateSectionsRequest,
)
from app.applications.race_preparation.services.gpx_parser import (
    compute_sections,
    parse_gpx,
)
from app.utils.exceptions import ResourceNotFoundError

logger = logging.getLogger(__name__)

GPX_UPLOAD_DIR = "/app/uploads/gpx"


def create_race(
    db: Session,
    user_id: int,
    file_content: str,
    file_name: str,
) -> dict:
    """Upload GPX, parse, stocke le fichier, crée race + track_points en BDD."""
    parsed = parse_gpx(file_content)
    metadata = parsed["metadata"]
    track_points = parsed["track_points"]

    race_dir = os.path.join(GPX_UPLOAD_DIR, str(user_id))
    os.makedirs(race_dir, exist_ok=True)

    race_repo = RaceRepository(db)
    race_id = race_repo.next_id()
    file_path = os.path.join(race_dir, f"{race_id}.gpx")
    with open(file_path, "w") as f:
        f.write(file_content)

    race = race_repo.create_race(
        user_id=user_id,
        name=metadata["name"] or file_name,
        file_name=file_name,
        gpx_file_path=file_path,
        total_distance=metadata["total_distance"],
        total_elevation_gain=metadata["total_elevation_gain"],
        total_elevation_loss=metadata["total_elevation_loss"],
    )

    tp_repo = TrackPointRepository(db)
    tp_repo.create_many(race.id, track_points)

    return {
        "id": race.id,
        "name": race.name,
        "file_name": race.file_name,
        "user_id": race.user_id,
        "gpx_file_path": race.gpx_file_path,
        "total_distance": race.total_distance,
        "total_elevation_gain": race.total_elevation_gain,
        "total_elevation_loss": race.total_elevation_loss,
        "sections": [],
        "created_at": race.created_at,
        "updated_at": race.updated_at,
    }


def list_races(db: Session, user_id: int) -> list[ApiReturnRace]:
    """Liste les races de l'utilisateur."""
    repo = RaceRepository(db)
    return [ApiReturnRace.model_validate(r) for r in repo.get_by_user(user_id)]


def get_race(db: Session, user_id: int, race_id: int) -> ApiReturnRace:
    """Retourne une race avec ses sections."""
    repo = RaceRepository(db)
    race = repo.get_by_user_and_id(user_id, race_id)
    if not race:
        raise ResourceNotFoundError(f"Race {race_id} introuvable")
    return ApiReturnRace.model_validate(race)


def get_track_points(db: Session, user_id: int, race_id: int) -> list[dict]:
    """Retourne les track points d'une race."""
    _assert_race_exists(db, user_id, race_id)
    tp_repo = TrackPointRepository(db)
    points = tp_repo.get_by_race(race_id)
    return [
        {"lat": p.lat, "lon": p.lon, "elevation": p.elevation, "distance": p.distance}
        for p in points
    ]


def calculate_sections(
    db: Session,
    user_id: int,
    race_id: int,
    request: ApiCalculateSectionsRequest,
) -> ApiReturnRace:
    """Calcule et persiste les sections à partir des marqueurs.

    Les marqueurs (limites de section ET ravitaillements) délimitent les sections.
    Les ravitaillements insèrent une section à vitesse 0 avec un temps d'attente.
    La première section commence forcément à 0, la dernière finit à totalDistance.
    """
    _assert_race_exists(db, user_id, race_id)

    tp_repo = TrackPointRepository(db)
    points = tp_repo.get_by_race(race_id)
    track_points = [
        {"lat": p.lat, "lon": p.lon, "elevation": p.elevation, "distance": p.distance}
        for p in points
    ]

    sorted_markers = sorted(request.markers, key=lambda m: m.distance)

    boundaries: list[dict] = []
    prev_dist = 0.0
    for marker in sorted_markers:
        if marker.distance > prev_dist:
            boundaries.append(
                {"start_distance": prev_dist, "end_distance": marker.distance}
            )
        prev_dist = marker.distance
    if prev_dist < track_points[-1]["distance"]:
        boundaries.append(
            {"start_distance": prev_dist, "end_distance": track_points[-1]["distance"]}
        )

    if not boundaries:
        boundaries.append(
            {"start_distance": 0.0, "end_distance": track_points[-1]["distance"]}
        )

    computed = compute_sections(track_points, boundaries)

    running_rows = [
        {
            "name": None,
            "section_type": c["section_type"],
            "start_distance": c["start_distance"],
            "end_distance": c["end_distance"],
            "distance": c["distance"],
            "elevation_gain": c["elevation_gain"],
            "elevation_loss": c["elevation_loss"],
            "average_gradient": c["average_gradient"],
            "start_elevation": c["start_elevation"],
            "end_elevation": c["end_elevation"],
            "pace": None,
            "actual_pace": None,
            "position": c["end_distance"],
        }
        for c in computed
    ]

    aid_rows: list[dict] = []
    for marker in sorted_markers:
        if marker.marker_type == "aid_station":
            aid_rows.append(
                {
                    "name": None,
                    "section_type": "aid_station",
                    "start_distance": marker.distance,
                    "end_distance": marker.distance,
                    "distance": 0.0,
                    "elevation_gain": 0.0,
                    "elevation_loss": 0.0,
                    "average_gradient": 0.0,
                    "start_elevation": 0.0,
                    "end_elevation": 0.0,
                    "pace": marker.wait_time if marker.wait_time is not None else 0.0,
                    "actual_pace": None,
                    "position": marker.distance,
                }
            )

    all_rows = sorted(running_rows + aid_rows, key=lambda r: r["position"])
    section_rows = [
        {k: v for k, v in row.items() if k != "position"}
        for row in all_rows
    ]
    for order, row in enumerate(section_rows):
        row["order_index"] = order

    SectionRepository(db).replace_all(race_id, section_rows)
    return get_race(db, user_id, race_id)


def update_sections(
    db: Session,
    user_id: int,
    race_id: int,
    request: ApiUpdateSectionsRequest,
) -> None:
    """Sauvegarde les noms, paces et actual_paces de toutes les sections."""
    _assert_race_exists(db, user_id, race_id)
    section_repo = SectionRepository(db)
    sections = section_repo.get_by_race(race_id)
    updates = [
        {
            "section_id": update.section_id,
            "name": update.name,
            "pace": update.pace,
            "actual_pace": update.actual_pace,
        }
        for update in request.sections
    ]
    section_repo.apply_updates(sections, updates)


def delete_race(db: Session, user_id: int, race_id: int) -> None:
    """Supprime une race + fichier GPX + track_points + sections."""
    race = _assert_race_exists(db, user_id, race_id)

    tp_repo = TrackPointRepository(db)
    tp_repo.delete_by_race(race_id)

    section_repo = SectionRepository(db)
    section_repo.delete_by_race(race_id)

    if race.gpx_file_path and os.path.exists(race.gpx_file_path):
        os.remove(race.gpx_file_path)

    race_repo = RaceRepository(db)
    race_repo.delete_by_id(race_id)


def _assert_race_exists(db: Session, user_id: int, race_id: int) -> Race:
    """Vérifie que la race existe et appartient à l'utilisateur."""
    repo = RaceRepository(db)
    race = repo.get_by_user_and_id(user_id, race_id)
    if not race:
        raise ResourceNotFoundError(f"Race {race_id} introuvable")
    return race
