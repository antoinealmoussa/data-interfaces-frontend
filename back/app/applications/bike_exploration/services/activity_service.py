import logging
import threading
from collections.abc import Generator

from sqlalchemy.orm import Session

from app.applications.bike_exploration.repositories.activity_repository import ActivityRepository
from app.applications.bike_exploration.schemas.col import ApiReturnCol
from app.applications.bike_exploration.services.activity_parser import (
    count_cycling_activities,
    parse_zip_archive,
)
from app.applications.bike_exploration.services.col_matching_service import match_activity_cols
from app.applications.bike_exploration.services.upload_task import create_task
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)


def start_upload(db: Session, user_id: int, content: bytes, filename: str) -> str:
    """Lance le traitement en background et retourne le task_id."""
    task = create_task()
    logger.info("Upload reçu: %s (%.1f MB)", filename, len(content) / 1024 / 1024)

    def _run() -> None:
        background_db = SessionLocal()
        try:
            for event in process_upload_events(
                background_db, user_id, content, filename, cancel_event=task.cancelled
            ):
                task.events.put(event)
            task.events.put(None)
        except Exception as e:
            logger.error("Thread upload crashé: %s", e, exc_info=True)
            task.status = "error"
            task.error = str(e)
            task.events.put({"type": "error", "message": str(e)})
            task.events.put(None)
        finally:
            background_db.close()

    thread = threading.Thread(target=_run, daemon=True)
    thread.start()
    return task.id


def process_upload_events(
    db: Session,
    user_id: int,
    content: bytes,
    filename: str,
    cancel_event: threading.Event | None = None,
) -> Generator[dict, None, None]:
    """Parse le fichier uploadé, crée les activités, matche les cols.
    Si cancel_event est set, arrête le traitement et yield cancelled."""
    repo = ActivityRepository(db)

    total = count_cycling_activities(content, filename)
    yield {"type": "start", "total": total}

    created_count = 0
    skipped_count = 0
    failed_count = 0
    all_matched_cols: list[ApiReturnCol] = []
    seen_col_ids: set[int] = set()

    for act_data in parse_zip_archive(content, filename, cancel_event=cancel_event):
        if act_data is None:
            continue

        if cancel_event and cancel_event.is_set():
            yield {
                "type": "cancelled",
                "created": created_count,
                "skipped": skipped_count,
                "failed": failed_count,
            }
            return

        try:
            existing = repo.get_by_user_and_strava_id(user_id, act_data.strava_activity_id)
            if existing:
                skipped_count += 1
                yield {
                    "type": "progress",
                    "current": created_count + skipped_count + failed_count,
                    "total": total,
                    "name": act_data.name,
                }
                continue

            activity = repo.create_from_act_data(user_id, act_data)
            match_activity_cols(db, activity, act_data.gps_points)
            db.refresh(activity)

            for col in activity.cols:
                api_col = ApiReturnCol.model_validate(col)
                if api_col.id not in seen_col_ids:
                    seen_col_ids.add(api_col.id)
                    all_matched_cols.append(api_col)

            created_count += 1
            yield {
                "type": "progress",
                "current": created_count + skipped_count + failed_count,
                "total": total,
                "name": act_data.name,
            }
        except Exception:
            logger.exception("Erreur lors du traitement de l'activité: %s", act_data.name)
            failed_count += 1
            yield {
                "type": "progress",
                "current": created_count + skipped_count + failed_count,
                "total": total,
                "name": act_data.name,
            }

    yield {
        "type": "complete",
        "created": created_count,
        "skipped": skipped_count,
        "failed": failed_count,
        "cols": [c.model_dump() for c in all_matched_cols],
    }


def reset_user_data(db: Session, user_id: int) -> dict[str, int]:
    repo = ActivityRepository(db)
    total = repo.count_by_user(user_id)
    repo.delete_by_user(user_id)
    logger.info("Données supprimées pour l'utilisateur %d: %d activités", user_id, total)
    return {"deleted_activities": total}
