import csv
import gzip
import io
import logging
import re
import threading
import zipfile
from collections.abc import Generator
from dataclasses import dataclass
from datetime import datetime

from app.applications.bike_exploration.services.fit_service import parse_fit_text

logger = logging.getLogger(__name__)

_FRENCH_MONTHS: dict[str, int] = {
    "janv.": 1, "févr.": 2, "mars": 3, "avr.": 4,
    "mai": 5, "juin": 6, "juil.": 7, "août": 8,
    "sept.": 9, "oct.": 10, "nov.": 11, "déc.": 12,
}


def _parse_date(date_str: str | None) -> datetime | None:
    if not date_str:
        return None
    cleaned = date_str.strip().strip('"')
    if not cleaned:
        return None
    try:
        return datetime.fromisoformat(cleaned)
    except ValueError:
        pass
    try:
        match = re.match(
            r"(\d{1,2})\s+(\S+)\s+(\d{4}),\s*(\d{2}:\d{2}:\d{2})",
            cleaned,
        )
        if not match:
            return None
        day, month_str, year, time_str = match.groups()
        month = _FRENCH_MONTHS.get(month_str.lower())
        if month is None:
            return None
        return datetime.strptime(f"{year}-{month:02d}-{day} {time_str}", "%Y-%m-%d %H:%M:%S")
    except (ValueError, IndexError):
        return None


@dataclass
class ActivityData:
    strava_activity_id: int
    name: str
    start_date: datetime
    gps_points: list[tuple[float, float]]


def count_cycling_activities(content: bytes, filename: str) -> int:
    if not filename.lower().endswith(".zip"):
        return 0
    with zipfile.ZipFile(io.BytesIO(content)) as zf:
        csv_name = _find_csv(zf.namelist())
        if csv_name is None:
            return 0
        csv_entries = _parse_activities_csv(zf.read(csv_name))
        return len(csv_entries)


def parse_zip_archive(
    content: bytes,
    filename: str,
    limit: int | None = None,
    cancel_event: threading.Event | None = None,
) -> Generator[ActivityData, None, None]:
    if not filename.lower().endswith(".zip"):
        raise ValueError(f"Format non supporté : {filename}. ZIP requis.")
    logger.info("Fichier ZIP reçu: %s", filename)
    yield from _parse_zip(content, limit, cancel_event)


def _parse_zip(
    content: bytes,
    limit: int | None = None,
    cancel_event: threading.Event | None = None,
) -> Generator[ActivityData, None, None]:
    with zipfile.ZipFile(io.BytesIO(content)) as zf:
        names = zf.namelist()
        logger.info("Contenu du ZIP: %d fichiers", len(names))

        csv_name = _find_csv(names)
        if csv_name is None:
            logger.error("Fichier activities.csv introuvable dans le ZIP")
            return

        logger.info("CSV trouvé: %s", csv_name)
        csv_entries = _parse_activities_csv(zf.read(csv_name))
        logger.info("Activités Vélo dans le CSV: %d", len(csv_entries))

        imported = 0
        for entry in csv_entries:
            if limit is not None and imported >= limit:
                break

            if cancel_event and cancel_event.is_set():
                logger.debug("Parsing annulé après %d activités", imported)
                return

            fit_path = entry.fit_path
            if fit_path not in names:
                logger.debug("Fichier FIT introuvable: %s", fit_path)
                continue

            try:
                fit_bytes = gzip.decompress(zf.read(fit_path))
                gps_points = parse_fit_text(fit_bytes, fit_path)
                if gps_points:
                    parsed_date = _parse_date(entry.start_date)
                    if parsed_date is None:
                        logger.warning("Date invalide pour %s: %s", entry.name, entry.start_date)
                        continue
                    yield ActivityData(
                        strava_activity_id=entry.strava_activity_id,
                        name=entry.name,
                        start_date=parsed_date,
                        gps_points=gps_points,
                    )
                    logger.info("Activité parsée: %s (%d pts)", entry.name, len(gps_points))
            except Exception:
                logger.exception("Erreur traitement %s", fit_path)
            imported += 1


def _find_csv(names: list[str]) -> str | None:
    for name in names:
        if name.lower().endswith("activities.csv"):
            return name
    return None


@dataclass
class CsvEntry:
    strava_activity_id: int
    name: str
    start_date: str
    activity_type: str
    fit_path: str


def _find_col(fieldnames: list[str], *keywords: str) -> str | None:
    """Trouve une colonne dont le nom contient tous les mots-clés."""
    for fn in fieldnames:
        lower = fn.lower()
        if all(kw in lower for kw in keywords):
            return fn
    return None


def _parse_activities_csv(csv_bytes: bytes) -> list[CsvEntry]:
    text = csv_bytes.decode("utf-8", errors="replace")
    if text.startswith("\ufeff"):
        text = text[1:]

    reader = csv.DictReader(io.StringIO(text), delimiter=",")
    fieldnames = reader.fieldnames or []
    logger.info("Colonnes CSV: %d", len(fieldnames))

    id_col = _find_col(fieldnames, "id", "activité")
    name_col = _find_col(fieldnames, "nom", "activité")
    date_col = _find_col(fieldnames, "date", "activité")
    type_col = _find_col(fieldnames, "type", "activité")
    file_col = _find_col(fieldnames, "nom", "fichier")

    if type_col is None:
        logger.error("Colonne de type d'activité introuvable")
        return []
    if file_col is None:
        logger.error("Colonne «Nom du fichier» introuvable")
        return []
    if id_col is None:
        logger.error("Colonne d'ID d'activité introuvable")
        return []

    logger.info("Colonnes utilisées: id=%s, name=%s, date=%s, type=%s, file=%s",
                id_col, name_col, date_col, type_col, file_col)

    entries: list[CsvEntry] = []
    for row in reader:
        activity_type = row.get(type_col, "").strip().strip('"')
        if activity_type != "Vélo":
            continue

        raw_id = row.get(id_col, "").strip().strip('"')
        if not raw_id:
            continue
        try:
            strava_id = int(raw_id)
        except ValueError:
            logger.debug("ID invalide: %s", raw_id)
            continue

        fit_path = row.get(file_col, "").strip().strip('"')
        if not fit_path:
            logger.debug("Chemin FIT manquant pour l'activité %d", strava_id)
            continue

        entries.append(CsvEntry(
            strava_activity_id=strava_id,
            name=row.get(name_col, "").strip().strip('"') if name_col else "",
            start_date=row.get(date_col, "").strip().strip('"') if date_col else "",
            activity_type=activity_type,
            fit_path=fit_path,
        ))

    logger.info("Activités Vélo retenues: %d", len(entries))
    return entries
