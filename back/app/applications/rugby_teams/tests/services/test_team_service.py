import pytest

from app.applications.rugby_teams.models.season import Season
from app.applications.rugby_teams.schemas.player import PlayerBase
from app.applications.rugby_teams.schemas.season import ApiCreateSeason
from app.applications.rugby_teams.schemas.team import ApiCreateTeam
from app.applications.rugby_teams.services import player_service, season_service, team_service
from app.utils.exceptions import (
    ForbiddenError,
    InvalidRequestError,
    PlayerNotFoundError,
    TeamNotFoundError,
)


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
        season_name="2025-2026",
    )
    created = team_service.create_team(db_session, team_in, user_id=test_user.id)
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
        season_name="2025-2026",
    )
    team_service.create_team(db_session, team_in, user_id=test_user.id)

    teams = team_service.get_teams_by_user(db_session, 999)
    assert teams == []


def test_get_teams_by_season(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_in = ApiCreateTeam(
        name="Mon équipe",
        categories=["Mixte"],
        season_name="2025-2026",
    )
    team_service.create_team(db_session, team_in, user_id=test_user.id)

    teams = team_service.get_teams_by_season(db_session, season.id, test_user.id)
    assert len(teams) == 1


def test_get_teams_by_season_no_match(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    teams = team_service.get_teams_by_season(db_session, season.id, test_user.id)
    assert teams == []


def test_has_user_teams_true(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_in = ApiCreateTeam(
        name="Mon équipe",
        categories=["Mixte"],
        season_name="2025-2026",
    )
    team_service.create_team(db_session, team_in, user_id=test_user.id)

    assert team_service.has_user_teams(db_session, test_user.id) is True


def test_has_user_teams_false(db_session, test_user):
    assert team_service.has_user_teams(db_session, test_user.id) is False


def test_create_team_success(db_session, test_user):
    team_in = ApiCreateTeam(
        name="Nouvelle équipe",
        categories=["Mixte", "+35"],
        season_name="2025-2026",
    )
    result = team_service.create_team(db_session, team_in, user_id=test_user.id)
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
        season_name="2026-2027",
    )
    result = team_service.create_team(db_session, team_in, user_id=test_user.id)
    assert result.seasons[0].name == "2026-2027"


def test_create_team_reuses_existing_season(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_in = ApiCreateTeam(
        name="Équipe",
        categories=["Mixte"],
        season_name="2025-2026",
    )
    result = team_service.create_team(db_session, team_in, user_id=test_user.id)
    assert result.seasons[0].id == season.id


def test_get_team_by_id_found(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_in = ApiCreateTeam(
        name="Mon équipe", categories=["Mixte"],
        season_name="2025-2026",
    )
    created = team_service.create_team(db_session, team_in, user_id=test_user.id)

    result = team_service.get_team_by_id(db_session, created.id)
    assert result is not None
    assert result.id == created.id


def test_get_team_by_id_not_found(db_session):
    result = team_service.get_team_by_id(db_session, 999)
    assert result is None


def test_delete_team_success(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_in = ApiCreateTeam(
        name="Mon équipe", categories=["Mixte"],
        season_name="2025-2026",
    )
    created = team_service.create_team(db_session, team_in, user_id=test_user.id)

    team_service.delete_team(db_session, created.id, test_user.id)

    assert team_service.get_team_by_id(db_session, created.id) is None
    assert season_service.get_season_by_id(db_session, season.id) is None


def test_delete_team_not_found(db_session, test_user):
    with pytest.raises(TeamNotFoundError):
        team_service.delete_team(db_session, 999, test_user.id)


def test_delete_team_forbidden(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_in = ApiCreateTeam(
        name="Mon équipe", categories=["Mixte"],
        season_name="2025-2026",
    )
    created = team_service.create_team(db_session, team_in, user_id=test_user.id)

    with pytest.raises(ForbiddenError):
        team_service.delete_team(db_session, created.id, 999)


def test_delete_team_keeps_shared_season(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team1_in = ApiCreateTeam(
        name="Équipe A", categories=["Mixte"],
        season_name="2025-2026",
    )
    team2_in = ApiCreateTeam(
        name="Équipe B", categories=["+35"],
        season_name="2025-2026",
    )
    team1 = team_service.create_team(db_session, team1_in, user_id=test_user.id)
    team_service.create_team(db_session, team2_in, user_id=test_user.id)

    team_service.delete_team(db_session, team1.id, test_user.id)

    assert season_service.get_season_by_id(db_session, season.id) is not None


class TestCreateSeasonForTeam:
    def _setup_team_and_player(self, db_session, test_user):
        team_in = ApiCreateTeam(
            name="Mon équipe",
            categories=["Mixte"],
            season_name="2025-2026",
        )
        team = team_service.create_team(db_session, team_in, user_id=test_user.id)
        old_season = season_service.get_season_by_name(db_session, "2025-2026")
        player = player_service.create_player(
            db_session,
            team.name,
            old_season.id,
            PlayerBase(
                name="Jean",
                level=2,
                sex="H",
                position="Ailier",
                category_names=["Mixte"],
            ),
            test_user.id,
        )
        return team, old_season, player

    def test_success(self, db_session, test_user):
        team, old_season, player = self._setup_team_and_player(db_session, test_user)

        result = team_service.create_season_for_team(
            db_session,
            team.name,
            ApiCreateSeason(name="2026-2027", player_ids=[player.id]),
            test_user.id,
        )

        season_names = [s.name for s in result.seasons]
        assert "2026-2027" in season_names
        new_season = season_service.get_season_by_name(db_session, "2026-2027")
        players = player_service.get_players_by_team(
            db_session, team.name, new_season.id, test_user.id
        )
        assert [p.id for p in players] == [player.id]

    def test_empty_roster(self, db_session, test_user):
        team, old_season, _ = self._setup_team_and_player(db_session, test_user)

        result = team_service.create_season_for_team(
            db_session,
            team.name,
            ApiCreateSeason(name="2026-2027", player_ids=[]),
            test_user.id,
        )

        assert len([s for s in result.seasons if s.name == "2026-2027"]) == 1

    def test_duplicate_season(self, db_session, test_user):
        team, old_season, _ = self._setup_team_and_player(db_session, test_user)

        with pytest.raises(InvalidRequestError):
            team_service.create_season_for_team(
                db_session,
                team.name,
                ApiCreateSeason(name="2025-2026", player_ids=[]),
                test_user.id,
            )

    def test_player_not_in_team(self, db_session, test_user):
        team, old_season, _ = self._setup_team_and_player(db_session, test_user)

        with pytest.raises(PlayerNotFoundError):
            team_service.create_season_for_team(
                db_session,
                team.name,
                ApiCreateSeason(name="2026-2027", player_ids=[9999]),
                test_user.id,
            )

    def test_team_not_found(self, db_session, test_user):
        with pytest.raises(TeamNotFoundError):
            team_service.create_season_for_team(
                db_session,
                "Equipe inexistante",
                ApiCreateSeason(name="2026-2027", player_ids=[]),
                test_user.id,
            )

    def test_other_user_sees_team_as_not_found(self, db_session, test_user):
        team, old_season, _ = self._setup_team_and_player(db_session, test_user)

        with pytest.raises(TeamNotFoundError):
            team_service.create_season_for_team(
                db_session,
                team.name,
                ApiCreateSeason(name="2026-2027", player_ids=[]),
                999,
            )
