from sqlalchemy.orm import Session
from app.models.season import Season
from fastapi import HTTPException, status

def get_seasons(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Season).offset(skip).limit(limit).all()

def get_season_by_id(db: Session, season_id: int):
    return db.query(Season).filter(Season.id == season_id).first()

def get_season_by_name(db: Session, name: str):
    return db.query(Season).filter(Season.name == name).first()

def create_season_if_not_exists(db: Session, season_name: str):
    """Crée la saison si elle n'existe pas encore. Retourne l'objet Season."""
    existing = get_season_by_name(db, season_name)
    if existing:
        return existing
    
    db_season = Season(name=season_name)
    db.add(db_season)
    db.commit()
    db.refresh(db_season)
    return db_season
