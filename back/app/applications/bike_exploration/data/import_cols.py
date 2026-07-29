"""
Importe les cols depuis raw/cols_enriched.csv dans be_col.

Usage :
    docker compose exec backend poetry run python \
        -m app.applications.bike_exploration.data.import_cols
"""
import csv
import os

from sqlalchemy.dialects.postgresql import insert

from app.applications.bike_exploration.models.col import Col
from app.db.session import SessionLocal

COUNTRY_MAP = {
    "france": "France",
    "italy": "Italie",
    "switzerland": "Suisse",
    "spain": "Espagne",
}

CSV_PATH = os.path.join(os.path.dirname(__file__), "raw", "cols_enriched.csv")


def main() -> None:
    db = SessionLocal()
    try:
        with open(CSV_PATH, newline="") as f:
            reader = csv.DictReader(f)
            count = 0
            for row in reader:
                values = {
                    "osm_id": int(row["osm_id"]),
                    "name": row["name"],
                    "latitude": float(row["latitude"]),
                    "longitude": float(row["longitude"]),
                    "elevation": int(row["ele"]) if row["ele"] else None,
                    "country": COUNTRY_MAP.get(row["country"], row["country"]),
                }
                stmt = insert(Col).values(**values).on_conflict_do_update(
                    index_elements=["osm_id"],
                    set_={
                        "name": values["name"],
                        "latitude": values["latitude"],
                        "longitude": values["longitude"],
                        "elevation": values["elevation"],
                        "country": values["country"],
                    },
                )
                db.execute(stmt)
                count += 1
            db.commit()
            print(f"✅ {count} cols importés depuis {CSV_PATH}")
    except FileNotFoundError:
        print(f"⚠️  Fichier introuvable : {CSV_PATH}")
        print(
            "   Rends-toi dans l'application bike_exploration"
            " pour générer le CSV via Overpass API."
        )
    finally:
        db.close()


if __name__ == "__main__":
    from app.core.logging_config import setup_logging
    setup_logging()
    main()
