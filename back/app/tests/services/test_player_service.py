import pytest
from fastapi import HTTPException

from app.models.season import Season
from app.schemas.player import ApiCreatePlayer, ApiUpdatePlayer
from app.schemas.team import ApiCreateTeam
from app.services import player_service, team_service


@pytest.fixture
def team(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_in = ApiCreateTeam(
        name="Mon equipe",
        categories=["Mixte", "+35"],
        user_id=test_user.id,
        season_name="2025-2026",
    )
    return team_service.create_team(db_session, team_in)


class TestGetPlayersByTeam:
    def test_get_players_by_team_empty(self, db_session, team):
        players = player_service.get_players_by_team(db_session, team.name)
        assert players == []

    def test_get_players_by_team_with_data(self, db_session, team):
        player_in = ApiCreatePlayer(
            name="Jean",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte"],
        )
        created = player_service.create_player(db_session, team.name, player_in)

        players = player_service.get_players_by_team(db_session, team.name)
        assert len(players) == 1
        assert players[0].id == created.id

    def test_get_players_by_team_not_found(self, db_session):
        with pytest.raises(HTTPException) as exc:
            player_service.get_players_by_team(db_session, "Equipe inexistante")
        assert exc.value.status_code == 404

    def test_get_players_by_team_with_pagination(self, db_session, team):
        for name in ["Alice", "Bob", "Charlie"]:
            player_service.create_player(
                db_session,
                team.name,
                ApiCreatePlayer(
                    name=name,
                    level=2,
                    sex="H",
                    position="Ailier",
                    category_names=["Mixte"],
                ),
            )

        players = player_service.get_players_by_team(
            db_session, team.name, skip=1, limit=1
        )
        assert len(players) == 1
        assert players[0].name == "Bob"


class TestCreatePlayer:
    def test_create_player_success(self, db_session, team):
        player_in = ApiCreatePlayer(
            name="Jean Dupont",
            level=3,
            sex="H",
            position="Meneur",
            category_names=["Mixte", "+35"],
        )
        result = player_service.create_player(db_session, team.name, player_in)

        assert result.id is not None
        assert result.name == "Jean Dupont"
        assert result.level == 3
        assert result.sex == "H"
        assert result.position == "Meneur"
        assert result.team_name == team.name
        assert set(result.category_names) == {"Mixte", "+35"}

    def test_create_player_team_not_found(self, db_session):
        player_in = ApiCreatePlayer(
            name="Jean",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte"],
        )
        with pytest.raises(HTTPException) as exc:
            player_service.create_player(db_session, "Equipe inexistante", player_in)
        assert exc.value.status_code == 404


class TestUpdatePlayer:
    def test_update_player_success(self, db_session, team, test_user):
        player_in = ApiCreatePlayer(
            name="Jean",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte"],
        )
        created = player_service.create_player(db_session, team.name, player_in)

        update_in = ApiUpdatePlayer(
            name="Jean Modifié",
            level=3,
            sex="F",
            position="Meneur",
            category_names=["+35", "+50"],
        )
        result = player_service.update_player(
            db_session,
            created.id,
            team.name,
            test_user.id,
            update_in,
        )

        assert result.name == "Jean Modifié"
        assert result.level == 3
        assert result.sex == "F"
        assert result.position == "Meneur"
        assert set(result.category_names) == {"+35", "+50"}

    def test_update_player_not_found(self, db_session, team, test_user):
        update_in = ApiUpdatePlayer(
            name="Jean",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte"],
        )
        with pytest.raises(HTTPException) as exc:
            player_service.update_player(
                db_session, 999, team.name, test_user.id, update_in
            )
        assert exc.value.status_code == 404

    def test_update_player_wrong_team(self, db_session, team, test_user):
        player_in = ApiCreatePlayer(
            name="Jean",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte"],
        )
        created = player_service.create_player(db_session, team.name, player_in)

        update_in = ApiUpdatePlayer(
            name="Jean",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte"],
        )
        with pytest.raises(HTTPException) as exc:
            player_service.update_player(
                db_session, created.id, "Autre equipe", test_user.id, update_in
            )
        assert exc.value.status_code == 404

    def test_update_player_forbidden(self, db_session, team, test_user):
        player_in = ApiCreatePlayer(
            name="Jean",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte"],
        )
        created = player_service.create_player(db_session, team.name, player_in)

        update_in = ApiUpdatePlayer(
            name="Jean",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte"],
        )
        with pytest.raises(HTTPException) as exc:
            player_service.update_player(
                db_session, created.id, team.name, 999, update_in
            )
        assert exc.value.status_code == 403

    def test_update_player_categories_add_and_remove(self, db_session, team, test_user):
        player_in = ApiCreatePlayer(
            name="Jean",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte"],
        )
        created = player_service.create_player(db_session, team.name, player_in)

        update_in = ApiUpdatePlayer(
            name="Jean",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["+35", "+50", "Open masculin"],
        )
        result = player_service.update_player(
            db_session,
            created.id,
            team.name,
            test_user.id,
            update_in,
        )
        assert set(result.category_names) == {"+35", "+50", "Open masculin"}


class TestDeletePlayer:
    def test_delete_player_success(self, db_session, team, test_user):
        player_in = ApiCreatePlayer(
            name="Jean",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte"],
        )
        created = player_service.create_player(db_session, team.name, player_in)

        player_service.delete_player(db_session, created.id, team.name, test_user.id)

        assert player_service.get_player_by_id(db_session, created.id) is None

    def test_delete_player_not_found(self, db_session, team, test_user):
        with pytest.raises(HTTPException) as exc:
            player_service.delete_player(db_session, 999, team.name, test_user.id)
        assert exc.value.status_code == 404

    def test_delete_player_forbidden(self, db_session, team, test_user):
        player_in = ApiCreatePlayer(
            name="Jean",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte"],
        )
        created = player_service.create_player(db_session, team.name, player_in)

        with pytest.raises(HTTPException) as exc:
            player_service.delete_player(db_session, created.id, team.name, 999)
        assert exc.value.status_code == 403

    def test_delete_player_does_not_delete_category(self, db_session, team, test_user):
        from app.models.category import Category

        player_in = ApiCreatePlayer(
            name="Jean",
            level=2,
            sex="H",
            position="Ailier",
            category_names=["Mixte"],
        )
        created = player_service.create_player(db_session, team.name, player_in)

        player_service.delete_player(db_session, created.id, team.name, test_user.id)

        category = db_session.query(Category).filter(Category.name == "Mixte").first()
        assert category is not None
