from sqlalchemy.orm import Session
from app.models.team import Team
from app.models.season import Season
from app.schemas.team import ApiCreateTeam, ApiReturnTeam
from fastapi import HTTPException, status
from app.services import season_service


def get_teams_by_user(db: Session, user_id: int):
    return db.query(Team).filter(Team.user_id == user_id).all()


def get_teams_by_season(db: Session, season_id: int):
    return db.query(Team).join(Team.seasons).filter(Season.id == season_id).all()


def has_user_teams(db: Session, user_id: int) -> bool:
    """Vérifie si l'utilisateur a au moins une équipe."""
    return db.query(Team).filter(Team.user_id == user_id).count() > 0


def get_team_by_id(db: Session, team_id: int):
    return db.query(Team).filter(Team.id == team_id).first()


def create_team(db: Session, team_in: ApiCreateTeam):
    # Créer ou récupérer la saison (une seule)
    season = season_service.create_season_if_not_exists(db, team_in.season_name)

    # Créer l'équipe
    db_team = Team(
        name=team_in.name,
        categories=team_in.categories,
        user_id=team_in.user_id,
        seasons=[season],
    )

    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return ApiReturnTeam(
        id=db_team.id,
        name=db_team.name,
        categories=db_team.categories,
        user_id=db_team.user_id,
        seasons=db_team.seasons,
    )
