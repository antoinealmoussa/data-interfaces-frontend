import logging
import os
import uuid

from sqlalchemy.orm import Session

from app.applications.race_preparation.models.race import Race
from app.applications.race_preparation.repositories.race_repository import RaceRepository
from app.applications.race_preparation.repositories.section_repository import SectionRepository
from app.applications.race_preparation.repositories.track_point_repository import (
    TrackPointRepository,
)
from app.applications.race_preparation.schemas.race import ApiReturnRace
from app.applications.race_preparation.schemas.section import (
    ApiComputeSectionsRequest,
    ApiComputedSection,
    ApiUpdateSectionsRequest,
)
from app.applications.race_preparation.services.gpx_parser import compute_sections, parse_gpx
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

    race_id = _next_race_id(db)
    file_path = os.path.join(race_dir, f"{race_id}.gpx")
    with open(file_path, "w") as f:
        f.write(file_content)

    race_repo = RaceRepository(db)
    race = Race(
        user_id=user_id,
        name=metadata["name"] or file_name,
        file_name=file_name,
        gpx_file_path=file_path,
        total_distance=metadata["total_distance"],
        total_elevation_gain=metadata["total_elevation_gain"],
        total_elevation_loss=metadata["total_elevation_loss"],
    )
    db.add(race)
    db.commit()
    db.refresh(race)

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


def compute_section_characteristics(
    db: Session,
    user_id: int,
    race_id: int,
    request: ApiComputeSectionsRequest,
) -> list[ApiComputedSection]:
    """Calcule les caractéristiques des sections à partir des bornes."""
    _assert_race_exists(db, user_id, race_id)
    tp_repo = TrackPointRepository(db)
    points = tp_repo.get_by_race(race_id)
    track_points = [
        {"lat": p.lat, "lon": p.lon, "elevation": p.elevation, "distance": p.distance}
        for p in points
    ]

    boundaries = [
        {"start_distance": b.start_distance, "end_distance": b.end_distance}
        for b in request.boundaries
    ]

    computed = compute_sections(track_points, boundaries)
    return [ApiComputedSection(**s) for s in computed]


def update_sections(
    db: Session,
    user_id: int,
    race_id: int,
    request: ApiUpdateSectionsRequest,
) -> list:
    """Sauvegarde les noms, paces et actual_paces de toutes les sections."""
    _assert_race_exists(db, user_id, race_id)
    section_repo = SectionRepository(db)
    sections = section_repo.get_by_race(race_id)
    sections_by_id = {s.id: s for s in sections}

    for update in request.sections:
        section = sections_by_id.get(update.section_id)
        if not section:
            continue
        if update.name is not None:
            section.name = update.name
        if update.pace is not None:
            section.pace = update.pace
        if update.actual_pace is not None:
            section.actual_pace = update.actual_pace

    db.commit()
    for s in sections:
        db.refresh(s)

    return [ApiReturnRace.model_validate(s.race) for s in sections]


def add_section(
    db: Session,
    user_id: int,
    race_id: int,
    name: str | None,
    section_type: str,
    insert_after_index: int,
) -> None:
    """Ajoute une section (ravitaillement) à une position donnée."""
    race = _assert_race_exists(db, user_id, race_id)
    section_repo = SectionRepository(db)
    sections = section_repo.get_by_race(race_id)

    default_pace = 0.0 if section_type == "aid_station" else None

    new_section = section_repo.model_class(
        race_id=race_id,
        order_index=insert_after_index + 1,
        name=name,
        section_type=section_type,
        start_distance=0.0,
        end_distance=0.0,
        distance=0.0,
        elevation_gain=0.0,
        elevation_loss=0.0,
        average_gradient=0.0,
        start_elevation=0.0,
        end_elevation=0.0,
        pace=default_pace,
    )
    db.add(new_section)
    db.commit()

    for s in sections:
        if s.order_index > insert_after_index:
            s.order_index += 1
    db.commit()


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


def _next_race_id(db: Session) -> int:
    """Retourne le prochain ID de race (pour le nom de fichier)."""
    last = db.query(Race.id).order_by(Race.id.desc()).first()
    return (last[0] + 1) if last else 1
