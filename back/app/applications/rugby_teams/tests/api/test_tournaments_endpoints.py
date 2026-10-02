from fastapi import status


def _create_team_and_season(authenticated_client, db_session) -> int:
    from app.applications.rugby_teams.models.season import Season

    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_data = {
        "name": "Mon equipe",
        "categories": ["Mixte"],
        "season_name": "2025-2026",
    }
    authenticated_client.post("/api/v1/rugby-teams/teams", json=team_data)
    return season.id


PLAYER_DATA = {
    "name": "Jean",
    "level": 2,
    "sex": "H",
    "position": "Ailier",
    "category_names": ["Mixte"],
}

TOURNAMENT_DATA = {
    "name": "Tournoi de test",
    "category_name": "Mixte",
    "player_names": ["Jean"],
}


def _create_player(authenticated_client, season_id):
    return authenticated_client.post(
        f"/api/v1/rugby-teams/teams/Mon equipe/players?season_id={season_id}",
        json=PLAYER_DATA,
    )


def test_read_tournaments_empty(authenticated_client, test_user, db_session):
    season_id = _create_team_and_season(authenticated_client, db_session)

    response = authenticated_client.get(
        f"/api/v1/rugby-teams/teams/Mon equipe/tournaments?season_id={season_id}"
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_read_tournaments_unauthenticated(client):
    response = client.get("/api/v1/rugby-teams/teams/Mon equipe/tournaments?season_id=1")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_create_tournament_success(authenticated_client, test_user, db_session):
    season_id = _create_team_and_season(authenticated_client, db_session)
    _create_player(authenticated_client, season_id)

    response = authenticated_client.post(
        f"/api/v1/rugby-teams/teams/Mon equipe/tournaments?season_id={season_id}",
        json=TOURNAMENT_DATA,
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Tournoi de test"
    assert data["category_name"] == "Mixte"
    assert data["player_names"] == ["Jean"]
    assert "id" in data


def test_create_tournament_unauthenticated(client):
    response = client.post(
        "/api/v1/rugby-teams/teams/equipe/tournaments?season_id=1", json=TOURNAMENT_DATA
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_read_tournament_by_id(authenticated_client, test_user, db_session):
    season_id = _create_team_and_season(authenticated_client, db_session)
    _create_player(authenticated_client, season_id)

    create_resp = authenticated_client.post(
        f"/api/v1/rugby-teams/teams/Mon equipe/tournaments?season_id={season_id}",
        json=TOURNAMENT_DATA,
    )
    tournament_id = create_resp.json()["id"]

    response = authenticated_client.get(
        f"/api/v1/rugby-teams/teams/Mon equipe/tournaments/{tournament_id}?season_id={season_id}"
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Tournoi de test"


def test_read_tournament_not_found(authenticated_client):
    response = authenticated_client.get(
        "/api/v1/rugby-teams/teams/Mon equipe/tournaments/999?season_id=1"
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_tournament_success(authenticated_client, test_user, db_session):
    season_id = _create_team_and_season(authenticated_client, db_session)
    _create_player(authenticated_client, season_id)

    create_resp = authenticated_client.post(
        f"/api/v1/rugby-teams/teams/Mon equipe/tournaments?season_id={season_id}",
        json=TOURNAMENT_DATA,
    )
    tournament_id = create_resp.json()["id"]

    update_data = {
        "name": "Tournoi modifié",
        "category_name": "Mixte",
        "player_names": ["Jean"],
    }
    response = authenticated_client.put(
        f"/api/v1/rugby-teams/teams/Mon equipe/tournaments/{tournament_id}?season_id={season_id}",
        json=update_data,
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Tournoi modifié"


def test_delete_tournament_success(authenticated_client, test_user, db_session):
    season_id = _create_team_and_season(authenticated_client, db_session)
    _create_player(authenticated_client, season_id)

    create_resp = authenticated_client.post(
        f"/api/v1/rugby-teams/teams/Mon equipe/tournaments?season_id={season_id}",
        json=TOURNAMENT_DATA,
    )
    tournament_id = create_resp.json()["id"]

    response = authenticated_client.delete(
        f"/api/v1/rugby-teams/teams/Mon equipe/tournaments/{tournament_id}?season_id={season_id}"
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
