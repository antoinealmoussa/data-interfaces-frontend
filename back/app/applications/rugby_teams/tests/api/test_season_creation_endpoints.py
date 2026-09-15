from fastapi import status


def _create_team_and_player(authenticated_client, db_session) -> tuple[int, int]:
    """Crée la saison 2025-2026, l'équipe et un joueur. Retourne (season_id, player_id)."""
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

    player_data = {
        "name": "Jean",
        "level": 2,
        "sex": "H",
        "position": "Ailier",
        "category_names": ["Mixte"],
    }
    create_player = authenticated_client.post(
        f"/api/v1/rugby-teams/teams/Mon equipe/players?season_id={season.id}",
        json=player_data,
    )
    return season.id, create_player.json()["id"]


def test_create_season_success(authenticated_client, test_user, db_session):
    _, player_id = _create_team_and_player(authenticated_client, db_session)

    response = authenticated_client.post(
        "/api/v1/rugby-teams/teams/Mon equipe/seasons",
        json={"name": "2026-2027", "player_ids": [player_id]},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Mon equipe"
    season_names = [s["name"] for s in data["seasons"]]
    assert "2026-2027" in season_names

    # Le joueur est membre de la nouvelle saison
    players = authenticated_client.get(
        f"/api/v1/rugby-teams/teams/Mon equipe/players?season_id={_new_season_id(db_session)}"
    )
    assert len(players.json()) == 1
    assert players.json()[0]["id"] == player_id


def test_create_season_empty_roster(authenticated_client, test_user, db_session):
    _create_team_and_player(authenticated_client, db_session)

    response = authenticated_client.post(
        "/api/v1/rugby-teams/teams/Mon equipe/seasons",
        json={"name": "2026-2027", "player_ids": []},
    )
    assert response.status_code == status.HTTP_200_OK
    assert "2026-2027" in [s["name"] for s in response.json()["seasons"]]


def test_create_season_duplicate(authenticated_client, test_user, db_session):
    _create_team_and_player(authenticated_client, db_session)

    # La saison 2025-2026 est déjà associée via la création d'équipe
    response = authenticated_client.post(
        "/api/v1/rugby-teams/teams/Mon equipe/seasons",
        json={"name": "2025-2026", "player_ids": []},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_create_season_player_not_in_team(authenticated_client, test_user, db_session):
    _create_team_and_player(authenticated_client, db_session)

    response = authenticated_client.post(
        "/api/v1/rugby-teams/teams/Mon equipe/seasons",
        json={"name": "2026-2027", "player_ids": [9999]},
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_create_season_team_not_found(authenticated_client):
    response = authenticated_client.post(
        "/api/v1/rugby-teams/teams/EquipeInexistante/seasons",
        json={"name": "2026-2027", "player_ids": []},
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_create_season_unauthenticated(client):
    response = client.post(
        "/api/v1/rugby-teams/teams/Mon equipe/seasons",
        json={"name": "2026-2027", "player_ids": []},
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def _new_season_id(db_session) -> int:
    from app.applications.rugby_teams.models.season import Season

    season = db_session.query(Season).filter(Season.name == "2026-2027").first()
    return season.id
