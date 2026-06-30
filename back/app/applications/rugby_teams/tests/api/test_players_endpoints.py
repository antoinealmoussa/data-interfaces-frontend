from fastapi import status


def test_read_players_empty(authenticated_client, test_user, db_session):
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

    response = authenticated_client.get("/api/v1/teams/Mon equipe/players")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_read_players_unauthenticated(client):
    response = client.get("/api/v1/teams/Mon equipe/players")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_create_player_success(authenticated_client, test_user, db_session):
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
        "name": "Jean Dupont",
        "level": 2,
        "sex": "H",
        "position": "Ailier",
        "category_names": ["Mixte"],
    }
    response = authenticated_client.post(
        "/api/v1/teams/Mon equipe/players", json=player_data
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Jean Dupont"
    assert data["level"] == 2
    assert data["sex"] == "H"
    assert data["position"] == "Ailier"
    assert data["category_names"] == ["Mixte"]
    assert "id" in data


def test_create_player_unauthenticated(client):
    player_data = {
        "name": "Jean",
        "level": 2,
        "sex": "H",
        "position": "Ailier",
        "category_names": ["Mixte"],
    }
    response = client.post("/api/v1/teams/equipe/players", json=player_data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_read_players_with_data(authenticated_client, test_user, db_session):
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
        "name": "Jean Dupont",
        "level": 2,
        "sex": "H",
        "position": "Ailier",
        "category_names": ["Mixte"],
    }
    authenticated_client.post("/api/v1/teams/Mon equipe/players", json=player_data)

    response = authenticated_client.get("/api/v1/teams/Mon equipe/players")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Jean Dupont"


def test_update_player_success(authenticated_client, test_user, db_session):
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
    create_resp = authenticated_client.post(
        "/api/v1/teams/Mon equipe/players", json=player_data
    )
    player_id = create_resp.json()["id"]

    update_data = {
        "name": "Jean Modifié",
        "level": 3,
        "sex": "F",
        "position": "Meneur",
        "category_names": ["+35"],
    }
    response = authenticated_client.put(
        f"/api/v1/teams/Mon equipe/players/{player_id}", json=update_data
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Jean Modifié"
    assert data["level"] == 3


def test_update_player_unauthenticated(client):
    update_data = {
        "name": "Jean",
        "level": 2,
        "sex": "H",
        "position": "Ailier",
        "category_names": ["Mixte"],
    }
    response = client.put("/api/v1/teams/equipe/players/1", json=update_data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_delete_player_success(authenticated_client, test_user, db_session):
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
    create_resp = authenticated_client.post(
        "/api/v1/teams/Mon equipe/players", json=player_data
    )
    player_id = create_resp.json()["id"]

    response = authenticated_client.delete(
        f"/api/v1/teams/Mon equipe/players/{player_id}"
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT

    get_resp = authenticated_client.get("/api/v1/teams/Mon equipe/players")
    assert len(get_resp.json()) == 0


def test_delete_player_unauthenticated(client):
    response = client.delete("/api/v1/teams/equipe/players/1")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_create_player_team_not_found(authenticated_client):
    player_data = {
        "name": "Jean",
        "level": 2,
        "sex": "H",
        "position": "Ailier",
        "category_names": ["Mixte"],
    }
    response = authenticated_client.post(
        "/api/v1/teams/EquipeInexistante/players", json=player_data
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
