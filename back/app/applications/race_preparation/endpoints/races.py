from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.orm import Session

from app.applications.race_preparation.schemas.race import ApiReturnRace
from app.applications.race_preparation.schemas.section import (
    ApiCalculateSectionsRequest,
    ApiUpdateSectionsRequest,
)
from app.applications.race_preparation.services import race_service
from app.core.dependencies import get_current_active_user
from app.db.session import get_db
from app.models.user import User

router = APIRouter()


@router.post("", response_model=dict, status_code=201)
def upload_race(
    file: UploadFile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    content = file.file.read().decode("utf-8")
    return race_service.create_race(db, current_user.id, content, file.filename or "unknown.gpx")


@router.get("", response_model=list[ApiReturnRace])
def list_races(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return race_service.list_races(db, current_user.id)


@router.get("/{race_id}", response_model=ApiReturnRace)
def get_race(
    race_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return race_service.get_race(db, current_user.id, race_id)


@router.get("/{race_id}/track-points")
def get_track_points(
    race_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    points = race_service.get_track_points(db, current_user.id, race_id)
    return {"track_points": points}


@router.post("/{race_id}/sections/calculate", response_model=ApiReturnRace)
def calculate_sections(
    race_id: int,
    request: ApiCalculateSectionsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Calcule et persiste les sections à partir des marqueurs (limites + ravitaillements)."""
    return race_service.calculate_sections(db, current_user.id, race_id, request)


@router.put("/{race_id}/sections")
def update_sections(
    race_id: int,
    request: ApiUpdateSectionsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    race_service.update_sections(db, current_user.id, race_id, request)
    return {"status": "ok"}


@router.delete("/{race_id}")
def delete_race(
    race_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    race_service.delete_race(db, current_user.id, race_id)
    return {"status": "ok"}
