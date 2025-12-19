from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# URL de connexion à la base de données (utilise le nom du service Docker "db")
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@db:5432/localdb"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dépendance pour obtenir une session de base de données


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
