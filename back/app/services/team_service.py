from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.team import Team
from app.models.season import Season
from app.models.team_season import TeamSeason
from app.schemas.team import ApiCreateTeam, ApiReturnTeam
from app.services import season_service


def get_team_by_id(db: Session, team_id: int) -> Team | None:
    return db.query(Team).filter(Team.id == team_id).first()


def get_teams_by_user(db: Session, user_id: int):
    return db.query(Team).filter(Team.user_id == user_id).all()


def get_teams_by_season(db: Session, season_id: int):
    return db.query(Team).join(Team.seasons).filter(Season.id == season_id).all()


def has_user_teams(db: Session, user_id: int) -> bool:
    """Vérifie si l'utilisateur a au moins une équipe."""
    return db.query(Team).filter(Team.user_id == user_id).count() > 0


def create_team(db: Session, team_in: ApiCreateTeam) -> ApiReturnTeam:
    season = season_service.create_season_if_not_exists(db, team_in.season_name)

    db_team = Team(
        name=team_in.name,
        categories=team_in.categories,
        user_id=team_in.user_id,
        seasons=[season],
    )

    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return ApiReturnTeam.model_validate(db_team)


def delete_team(db: Session, team_id: int, user_id: int) -> None:
    team = get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Équipe non trouvée")
    if team.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'êtes pas autorisé à supprimer cette équipe",
        )

    seasons = list(team.seasons)

    db.delete(team)
    db.flush()

    for season in seasons:
        remaining = (
            db.query(TeamSeason)
            .filter(TeamSeason.season_id == season.id)
            .count()
        )
        if remaining == 0:
            db.delete(season)

    db.commit()
