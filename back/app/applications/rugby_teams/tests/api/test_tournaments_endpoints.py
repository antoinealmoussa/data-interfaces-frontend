from fastapi import status


def test_read_tournaments_empty(authenticated_client, test_user, db_session):
    from app.models.season import Season
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_data = {
        "name": "Mon equipe",
        "categories": ["Mixte"],
        "user_id": test_user.id,
        "season_name": "2025-2026",
    }
    authenticated_client.post("/api/v1/teams", json=team_data)

    response = authenticated_client.get("/api/v1/teams/Mon equipe/tournaments")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_read_tournaments_unauthenticated(client):
    response = client.get("/api/v1/teams/Mon equipe/tournaments")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_create_tournament_success(authenticated_client, test_user, db_session):
    from app.models.season import Season
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_data = {
        "name": "Mon equipe",
        "categories": ["Mixte"],
        "user_id": test_user.id,
        "season_name": "2025-2026",
    }
    authenticated_client.post("/api/v1/teams", json=team_data)

    player_data = {
        "name": "Jean",
        "level": 2,
        "sex": "H",
        "position": "Ailier",
        "category_names": ["Mixte"],
    }
    authenticated_client.post("/api/v1/teams/Mon equipe/players", json=player_data)

    tournament_data = {
        "name": "Tournoi de test",
        "category_name": "Mixte",
        "player_names": ["Jean"],
    }
    response = authenticated_client.post(
        "/api/v1/teams/Mon equipe/tournaments", json=tournament_data
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Tournoi de test"
    assert data["category_name"] == "Mixte"
    assert data["player_names"] == ["Jean"]
    assert "id" in data


def test_create_tournament_unauthenticated(client):
    tournament_data = {
        "name": "Tournoi",
        "category_name": "Mixte",
        "player_names": ["Jean"],
    }
    response = client.post("/api/v1/teams/equipe/tournaments", json=tournament_data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_read_tournament_by_id(authenticated_client, test_user, db_session):
    from app.models.season import Season
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_data = {
        "name": "Mon equipe",
        "categories": ["Mixte"],
        "user_id": test_user.id,
        "season_name": "2025-2026",
    }
    authenticated_client.post("/api/v1/teams", json=team_data)

    player_data = {
        "name": "Jean",
        "level": 2,
        "sex": "H",
        "position": "Ailier",
        "category_names": ["Mixte"],
    }
    authenticated_client.post("/api/v1/teams/Mon equipe/players", json=player_data)

    tournament_data = {
        "name": "Tournoi",
        "category_name": "Mixte",
        "player_names": ["Jean"],
    }
    create_resp = authenticated_client.post(
        "/api/v1/teams/Mon equipe/tournaments", json=tournament_data
    )
    tournament_id = create_resp.json()["id"]

    response = authenticated_client.get(
        f"/api/v1/teams/Mon equipe/tournaments/{tournament_id}"
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Tournoi"


def test_read_tournament_not_found(authenticated_client):
    response = authenticated_client.get("/api/v1/teams/Mon equipe/tournaments/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_update_tournament_success(authenticated_client, test_user, db_session):
    from app.models.season import Season
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_data = {
        "name": "Mon equipe",
        "categories": ["Mixte"],
        "user_id": test_user.id,
        "season_name": "2025-2026",
    }
    authenticated_client.post("/api/v1/teams", json=team_data)

    player_data = {
        "name": "Jean",
        "level": 2,
        "sex": "H",
        "position": "Ailier",
        "category_names": ["Mixte"],
    }
    authenticated_client.post("/api/v1/teams/Mon equipe/players", json=player_data)

    tournament_data = {
        "name": "Tournoi",
        "category_name": "Mixte",
        "player_names": ["Jean"],
    }
    create_resp = authenticated_client.post(
        "/api/v1/teams/Mon equipe/tournaments", json=tournament_data
    )
    tournament_id = create_resp.json()["id"]

    update_data = {
        "name": "Tournoi modifié",
        "category_name": "Mixte",
        "player_names": ["Jean"],
    }
    response = authenticated_client.put(
        f"/api/v1/teams/Mon equipe/tournaments/{tournament_id}", json=update_data
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "Tournoi modifié"


def test_delete_tournament_success(authenticated_client, test_user, db_session):
    from app.models.season import Season
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_data = {
        "name": "Mon equipe",
        "categories": ["Mixte"],
        "user_id": test_user.id,
        "season_name": "2025-2026",
    }
    authenticated_client.post("/api/v1/teams", json=team_data)

    player_data = {
        "name": "Jean",
        "level": 2,
        "sex": "H",
        "position": "Ailier",
        "category_names": ["Mixte"],
    }
    authenticated_client.post("/api/v1/teams/Mon equipe/players", json=player_data)

    tournament_data = {
        "name": "Tournoi",
        "category_name": "Mixte",
        "player_names": ["Jean"],
    }
    create_resp = authenticated_client.post(
        "/api/v1/teams/Mon equipe/tournaments", json=tournament_data
    )
    tournament_id = create_resp.json()["id"]

    response = authenticated_client.delete(
        f"/api/v1/teams/Mon equipe/tournaments/{tournament_id}"
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT
