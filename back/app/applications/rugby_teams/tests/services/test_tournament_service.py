import pytest

from app.applications.rugby_teams.models.season import Season
from app.applications.rugby_teams.schemas.player import PlayerBase
from app.applications.rugby_teams.schemas.tournament import TournamentBase
from app.applications.rugby_teams.services import player_service, tournament_service
from app.utils.exceptions import (
    CategoryNotFoundError,
    ForbiddenError,
    TeamNotFoundError,
    TournamentNotFoundError,
)


@pytest.fixture
def team(db_session, test_user):
    from app.applications.rugby_teams.schemas.team import ApiCreateTeam
    from app.applications.rugby_teams.services import team_service

    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_in = ApiCreateTeam(
        name="Mon equipe",
        categories=["Mixte", "+35"],
        season_name="2025-2026",
    )
    return team_service.create_team(db_session, team_in, user_id=test_user.id)


@pytest.fixture
def player(db_session, team, test_user):
    player_in = PlayerBase(
        name="Jean",
        level=2,
        sex="H",
        position="Ailier",
        category_names=["Mixte"],
    )
    return player_service.create_player(db_session, team.name, player_in, test_user.id)


class TestGetTournamentsByTeam:
    def test_empty(self, db_session, team, test_user):
        tournaments = tournament_service.get_tournaments_by_team(
            db_session, team.name, test_user.id
        )
        assert tournaments == []

    def test_with_data(self, db_session, team, player, test_user):
        tournament_in = TournamentBase(
            name="Tournoi test",
            category_name="Mixte",
            player_names=["Jean"],
        )
        tournament_service.create_tournament(db_session, team.name, tournament_in, test_user.id)

        tournaments = tournament_service.get_tournaments_by_team(
            db_session, team.name, test_user.id
        )
        assert len(tournaments) == 1


class TestCreateTournament:
    def test_success(self, db_session, team, player, test_user):
        tournament_in = TournamentBase(
            name="Tournoi test",
            category_name="Mixte",
            player_names=["Jean"],
        )
        result = tournament_service.create_tournament(
            db_session, team.name, tournament_in, test_user.id
        )
        assert result.name == "Tournoi test"
        assert result.category_name == "Mixte"
        assert result.player_names == ["Jean"]

    def test_forbidden(self, db_session, team, player):
        tournament_in = TournamentBase(
            name="Tournoi",
            category_name="Mixte",
            player_names=["Jean"],
        )
        with pytest.raises(ForbiddenError):
            tournament_service.create_tournament(db_session, team.name, tournament_in, 999)

    def test_category_not_found(self, db_session, team, player, test_user):
        tournament_in = TournamentBase(
            name="Tournoi",
            category_name="Inexistante",
            player_names=["Jean"],
        )
        with pytest.raises(CategoryNotFoundError):
            tournament_service.create_tournament(
                db_session, team.name, tournament_in, test_user.id
            )

    def test_team_not_found(self, db_session, player, test_user):
        tournament_in = TournamentBase(
            name="Tournoi",
            category_name="Mixte",
            player_names=["Jean"],
        )
        with pytest.raises(TeamNotFoundError):
            tournament_service.create_tournament(
                db_session, "Equipe inexistante", tournament_in, test_user.id
            )


class TestGetTournamentById:
    def test_found(self, db_session, team, player, test_user):
        tournament_in = TournamentBase(
            name="Tournoi",
            category_name="Mixte",
            player_names=["Jean"],
        )
        created = tournament_service.create_tournament(
            db_session, team.name, tournament_in, test_user.id
        )
        result = tournament_service.get_tournament_by_id(db_session, created.id)
        assert result is not None
        assert result.name == "Tournoi"

    def test_not_found(self, db_session):
        result = tournament_service.get_tournament_by_id(db_session, 999)
        assert result is None


class TestUpdateTournament:
    def test_success(self, db_session, team, player, test_user):
        tournament_in = TournamentBase(
            name="Tournoi",
            category_name="Mixte",
            player_names=["Jean"],
        )
        created = tournament_service.create_tournament(
            db_session, team.name, tournament_in, test_user.id
        )

        update_in = TournamentBase(
            name="Tournoi modifié",
            category_name="Mixte",
            player_names=["Jean"],
        )
        result = tournament_service.update_tournament(
            db_session, created.id, team.name, update_in, test_user.id
        )
        assert result.name == "Tournoi modifié"

    def test_not_found(self, db_session, team, test_user):
        update_in = TournamentBase(
            name="Tournoi",
            category_name="Mixte",
            player_names=["Jean"],
        )
        with pytest.raises(TournamentNotFoundError):
            tournament_service.update_tournament(
                db_session, 999, team.name, update_in, test_user.id
            )

    def test_forbidden(self, db_session, team, player, test_user):
        tournament_in = TournamentBase(
            name="Tournoi",
            category_name="Mixte",
            player_names=["Jean"],
        )
        created = tournament_service.create_tournament(
            db_session, team.name, tournament_in, test_user.id
        )

        update_in = TournamentBase(
            name="Tournoi modifié",
            category_name="Mixte",
            player_names=["Jean"],
        )
        with pytest.raises(ForbiddenError):
            tournament_service.update_tournament(
                db_session, created.id, team.name, update_in, 999
            )


class TestDeleteTournament:
    def test_success(self, db_session, team, player, test_user):
        tournament_in = TournamentBase(
            name="Tournoi",
            category_name="Mixte",
            player_names=["Jean"],
        )
        created = tournament_service.create_tournament(
            db_session, team.name, tournament_in, test_user.id
        )

        tournament_service.delete_tournament(
            db_session, created.id, team.name, test_user.id
        )
        assert tournament_service.get_tournament_by_id(db_session, created.id) is None

    def test_not_found(self, db_session, team, test_user):
        with pytest.raises(TournamentNotFoundError):
            tournament_service.delete_tournament(db_session, 999, team.name, test_user.id)

    def test_forbidden(self, db_session, team, player, test_user):
        tournament_in = TournamentBase(
            name="Tournoi",
            category_name="Mixte",
            player_names=["Jean"],
        )
        created = tournament_service.create_tournament(
            db_session, team.name, tournament_in, test_user.id
        )

        with pytest.raises(ForbiddenError):
            tournament_service.delete_tournament(
                db_session, created.id, team.name, 999
            )
