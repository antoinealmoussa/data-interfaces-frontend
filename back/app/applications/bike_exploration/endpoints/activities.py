from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.applications.bike_exploration.services.activity_service import (
    reset_user_data,
    start_upload,
)
from app.applications.bike_exploration.services.upload_task import cancel_task, stream_events
from app.core.token import get_current_active_user
from app.db.session import get_db
from app.models.user import User

router = APIRouter()


@router.post("/upload")
def upload_activities(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Reçoit le fichier, lance le traitement en background, retourne le task ID."""
    content = file.file.read()
    filename = file.filename or "unknown"
    task_id = start_upload(db, current_user.id, content, filename)
    return {"task_id": task_id}


@router.delete("/upload/{task_id}")
def cancel_upload(task_id: str):
    """Annule un upload en cours."""
    if not cancel_task(task_id):
        raise HTTPException(status_code=404, detail="Task non trouvée")
    return {"status": "cancelled"}


@router.get("/upload/{task_id}/progress")
def upload_progress(task_id: str):
    """SSE stream du progrès d'un upload."""
    try:
        gen = stream_events(task_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Task non trouvée")
    return StreamingResponse(
        gen,
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.delete("")
def reset_activities(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Supprime toutes les activités de l'utilisateur connecté."""
    return reset_user_data(db, current_user.id)
