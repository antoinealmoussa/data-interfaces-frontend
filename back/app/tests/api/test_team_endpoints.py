from fastapi import status
from app.models.season import Season


def test_read_teams_empty(authenticated_client, test_user):
    response = authenticated_client.get("/api/v1/teams")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_read_teams_with_data(authenticated_client, test_user, db_session):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_data = {
        "name": "Mon équipe",
        "categories": ["Mixte"],
        "user_id": test_user.id,
        "season_name": "2025-2026",
    }
    authenticated_client.post("/api/v1/teams", json=team_data)

    response = authenticated_client.get("/api/v1/teams")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Mon équipe"


def test_read_teams_unauthenticated(client):
    response = client.get("/api/v1/teams")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_has_teams_true(authenticated_client, test_user, db_session):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_data = {
        "name": "Mon équipe",
        "categories": ["Mixte"],
        "user_id": test_user.id,
        "season_name": "2025-2026",
    }
    authenticated_client.post("/api/v1/teams", json=team_data)

    response = authenticated_client.get("/api/v1/teams/has-teams")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() is True


def test_has_teams_false(authenticated_client):
    response = authenticated_client.get("/api/v1/teams/has-teams")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() is False


def test_read_teams_by_season(authenticated_client, test_user, db_session):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_data = {
        "name": "Mon équipe",
        "categories": ["Mixte"],
        "user_id": test_user.id,
        "season_name": "2025-2026",
    }
    authenticated_client.post("/api/v1/teams", json=team_data)

    response = authenticated_client.get(f"/api/v1/teams/by-season/{season.id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Mon équipe"


def test_read_teams_by_season_no_match(authenticated_client, db_session):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    response = authenticated_client.get(f"/api/v1/teams/by-season/{season.id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_create_team_success(authenticated_client, test_user):
    team_data = {
        "name": "Nouvelle équipe",
        "categories": ["Mixte", "+35"],
        "user_id": test_user.id,
        "season_name": "2025-2026",
    }
    response = authenticated_client.post("/api/v1/teams", json=team_data)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "Nouvelle équipe"
    assert data["categories"] == ["Mixte", "+35"]
    assert "id" in data
    assert len(data["seasons"]) == 1
    assert data["seasons"][0]["name"] == "2025-2026"


def test_create_team_unauthenticated(client):
    team_data = {
        "name": "Nouvelle équipe",
        "categories": ["Mixte"],
        "user_id": 1,
        "season_name": "2025-2026",
    }
    response = client.post("/api/v1/teams", json=team_data)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_create_team_invalid_name_empty(authenticated_client, test_user):
    team_data = {
        "name": "",
        "categories": ["Mixte"],
        "user_id": test_user.id,
        "season_name": "2025-2026",
    }
    response = authenticated_client.post("/api/v1/teams", json=team_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_team_invalid_name_too_long(authenticated_client, test_user):
    team_data = {
        "name": "A" * 51,
        "categories": ["Mixte"],
        "user_id": test_user.id,
        "season_name": "2025-2026",
    }
    response = authenticated_client.post("/api/v1/teams", json=team_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_team_invalid_categories_empty(authenticated_client, test_user):
    team_data = {
        "name": "Mon équipe",
        "categories": [],
        "user_id": test_user.id,
        "season_name": "2025-2026",
    }
    response = authenticated_client.post("/api/v1/teams", json=team_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_create_team_invalid_category_value(authenticated_client, test_user):
    team_data = {
        "name": "Mon équipe",
        "categories": ["InvalidCategory"],
        "user_id": test_user.id,
        "season_name": "2025-2026",
    }
    response = authenticated_client.post("/api/v1/teams", json=team_data)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
