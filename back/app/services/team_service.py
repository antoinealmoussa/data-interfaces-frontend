from sqlalchemy.orm import Session

from app.db.repositories import TeamRepository
from app.models.category import Category
from app.models.season import Season
from app.models.team import Team
from app.models.team_season import TeamSeason
from app.schemas.team import ApiCreateTeam, ApiReturnTeam
from app.services import season_service
from app.utils.exceptions import ForbiddenError, TeamNotFoundError


def get_team_by_id(db: Session, team_id: int) -> Team | None:
    repo = TeamRepository(db)
    return repo.get_by_id(team_id)


def get_team_by_name(db: Session, team_name: str) -> Team:
    team = db.query(Team).filter(Team.name == team_name).first()
    if not team:
        raise TeamNotFoundError(team_name)
    return team


def get_team_by_name_optional(db: Session, team_name: str) -> Team | None:
    return db.query(Team).filter(Team.name == team_name).first()


def get_teams_by_user(db: Session, user_id: int):
    repo = TeamRepository(db)
    return repo.get_many(user_id=user_id)


def get_teams_by_season(db: Session, season_id: int):
    return db.query(Team).join(Team.seasons).filter(Season.id == season_id).all()


def has_user_teams(db: Session, user_id: int) -> bool:
    repo = TeamRepository(db)
    return repo.db.query(Team).filter(Team.user_id == user_id).count() > 0


def create_team(db: Session, team_in: ApiCreateTeam) -> ApiReturnTeam:
    season = season_service.create_season_if_not_exists(db, team_in.season_name)

    category_objs = db.query(Category).filter(
        Category.name.in_(team_in.categories)
    ).all()

    db_team = Team(
        name=team_in.name,
        user_id=team_in.user_id,
        seasons=[season],
        categories=category_objs,
    )

    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return ApiReturnTeam.model_validate(db_team)


def delete_team(db: Session, team_id: int, user_id: int) -> None:
    team = get_team_by_id(db, team_id)
    if not team:
        raise TeamNotFoundError(str(team_id))
    if team.user_id != user_id:
        raise ForbiddenError("Vous n'êtes pas autorisé à supprimer cette équipe")

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
