from app.schemas.team import ApiCreateTeam
from app.services import team_service
from app.models.season import Season


def test_get_teams_by_user_empty(db_session, test_user):
    teams = team_service.get_teams_by_user(db_session, test_user.id)
    assert teams == []


def test_get_teams_by_user_with_data(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_in = ApiCreateTeam(
        name="Mon équipe",
        categories=["Mixte"],
        user_id=test_user.id,
        season_name="2025-2026",
    )
    created = team_service.create_team(db_session, team_in)
    teams = team_service.get_teams_by_user(db_session, test_user.id)
    assert len(teams) == 1
    assert teams[0].id == created.id


def test_get_teams_by_user_other_user(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_in = ApiCreateTeam(
        name="Mon équipe",
        categories=["Mixte"],
        user_id=test_user.id,
        season_name="2025-2026",
    )
    team_service.create_team(db_session, team_in)

    teams = team_service.get_teams_by_user(db_session, 999)
    assert teams == []


def test_get_teams_by_season(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_in = ApiCreateTeam(
        name="Mon équipe",
        categories=["Mixte"],
        user_id=test_user.id,
        season_name="2025-2026",
    )
    team_service.create_team(db_session, team_in)

    teams = team_service.get_teams_by_season(db_session, season.id)
    assert len(teams) == 1


def test_get_teams_by_season_no_match(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    teams = team_service.get_teams_by_season(db_session, season.id)
    assert teams == []


def test_has_user_teams_true(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_in = ApiCreateTeam(
        name="Mon équipe",
        categories=["Mixte"],
        user_id=test_user.id,
        season_name="2025-2026",
    )
    team_service.create_team(db_session, team_in)

    assert team_service.has_user_teams(db_session, test_user.id) is True


def test_has_user_teams_false(db_session, test_user):
    assert team_service.has_user_teams(db_session, test_user.id) is False


def test_create_team_success(db_session, test_user):
    team_in = ApiCreateTeam(
        name="Nouvelle équipe",
        categories=["Mixte", "+35"],
        user_id=test_user.id,
        season_name="2025-2026",
    )
    result = team_service.create_team(db_session, team_in)
    assert result.id is not None
    assert result.name == "Nouvelle équipe"
    assert result.categories == ["Mixte", "+35"]
    assert result.user_id == test_user.id
    assert len(result.seasons) == 1
    assert result.seasons[0].name == "2025-2026"


def test_create_team_creates_season(db_session, test_user):
    team_in = ApiCreateTeam(
        name="Équipe avec nouvelle saison",
        categories=["Open masculin"],
        user_id=test_user.id,
        season_name="2026-2027",
    )
    result = team_service.create_team(db_session, team_in)
    assert result.seasons[0].name == "2026-2027"


def test_create_team_reuses_existing_season(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_in = ApiCreateTeam(
        name="Équipe",
        categories=["Mixte"],
        user_id=test_user.id,
        season_name="2025-2026",
    )
    result = team_service.create_team(db_session, team_in)
    assert result.seasons[0].id == season.id
