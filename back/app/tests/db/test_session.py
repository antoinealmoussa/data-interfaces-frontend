from sqlalchemy.orm import Session

from app.db.session import get_db


def test_get_db_yields_session_and_closes():
    generator = get_db()
    db = next(generator)

    try:
        assert isinstance(db, Session)
    finally:
        generator.close()
