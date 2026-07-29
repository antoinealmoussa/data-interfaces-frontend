import json
import logging
import queue
import threading
import uuid
from collections.abc import Generator
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class UploadTask:
    id: str
    status: str = "processing"  # processing | complete | error | cancelled
    events: queue.Queue = field(default_factory=queue.Queue)
    error: str | None = None
    cancelled: threading.Event = field(default_factory=threading.Event)


_tasks: dict[str, UploadTask] = {}
_lock = threading.Lock()


def create_task() -> UploadTask:
    task_id = uuid.uuid4().hex[:12]
    task = UploadTask(id=task_id)
    with _lock:
        _tasks[task_id] = task
    return task


def get_task(task_id: str) -> UploadTask | None:
    return _tasks.get(task_id)


def remove_task(task_id: str) -> None:
    with _lock:
        _tasks.pop(task_id, None)


def cancel_task(task_id: str) -> bool:
    """Annule une task en cours. Retourne False si la task n'existe pas."""
    task = get_task(task_id)
    if not task:
        return False
    task.cancelled.set()
    task.status = "cancelled"
    return True


def stream_events(task_id: str) -> Generator[str, None, None]:
    """Génère les events SSE d'une task, puis la nettoie."""
    task = get_task(task_id)
    if not task:
        raise ValueError(f"Task {task_id} non trouvée")
    logger.debug("[%s] Début stream SSE", task_id)
    try:
        while True:
            try:
                event = task.events.get(timeout=300)
            except queue.Empty:
                logger.debug("[%s] Queue empty après timeout", task_id)
                if task.cancelled.is_set():
                    logger.debug("[%s] Task annulée pendant l'attente queue", task_id)
                    break
                continue
            if event is None:
                logger.debug("[%s] ← queue: sentinel — fin du stream", task_id)
                break
            logger.debug("[%s] ← queue: %s", task_id, event.get("type"))
            yield f"data: {json.dumps(event)}\n\n"
            logger.debug("[%s] ← SSE envoyé au client: %s", task_id, event.get("type"))
    except GeneratorExit:
        logger.debug("[%s] Client SSE déconnecté", task_id)
    except Exception:
        logger.debug("[%s] Timeout ou erreur sur la queue", task_id)
    finally:
        remove_task(task_id)
        logger.debug("[%s] Task nettoyée du registry", task_id)
