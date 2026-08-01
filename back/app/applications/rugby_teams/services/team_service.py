from sqlalchemy.orm import Session

from app.applications.rugby_teams.models.team import Team
from app.applications.rugby_teams.models.team_season import TeamSeason
from app.applications.rugby_teams.repositories.team_repository import TeamRepository
from app.applications.rugby_teams.schemas.team import ApiCreateTeam, ApiReturnTeam
from app.applications.rugby_teams.services import season_service
from app.applications.rugby_teams.services.category_service import resolve_categories
from app.utils.exceptions import ForbiddenError, TeamNotFoundError


def get_team_by_id(db: Session, team_id: int) -> Team | None:
    repo = TeamRepository(db)
    return repo.get_by_id(team_id)


def get_team_by_name(db: Session, team_name: str) -> Team:
    team = TeamRepository(db).find_by_name(team_name)
    if not team:
        raise TeamNotFoundError(team_name)
    return team


def get_team_by_name_optional(db: Session, team_name: str) -> Team | None:
    return TeamRepository(db).find_by_name(team_name)


def get_owned_team(db: Session, team_name: str, user_id: int) -> Team:
    team = TeamRepository(db).find_by_name(team_name)
    if not team or team.user_id != user_id:
        raise TeamNotFoundError(team_name)
    return team


def get_teams_by_user(db: Session, user_id: int):
    repo = TeamRepository(db)
    return repo.get_many(user_id=user_id)


def get_teams_by_season(db: Session, season_id: int, user_id: int):
    return TeamRepository(db).get_by_season(season_id, user_id)


def has_user_teams(db: Session, user_id: int) -> bool:
    return TeamRepository(db).count_by_user(user_id) > 0


def create_team(db: Session, team_in: ApiCreateTeam, user_id: int) -> ApiReturnTeam:
    season = season_service.create_season_if_not_exists(db, team_in.season_name)

    category_objs = resolve_categories(db, team_in.categories)

    db_team = Team(
        name=team_in.name,
        user_id=user_id,
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
