import json
import queue
import threading
import uuid
from collections.abc import Generator
from dataclasses import dataclass, field


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
    try:
        while True:
            try:
                event = task.events.get(timeout=300)
            except queue.Empty:
                if task.cancelled.is_set():
                    break
                continue
            if event is None:
                break
            yield f"data: {json.dumps(event)}\n\n"
    except GeneratorExit:
        pass
    except Exception:
        pass
    finally:
        remove_task(task_id)
