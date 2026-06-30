from fastapi import status


def test_read_seasons_empty(authenticated_client):
    response = authenticated_client.get("/api/v1/rugby-teams/seasons")
    assert response.status_code == status.HTTP_200_OK
    assert response.json() == []


def test_read_seasons_with_data(authenticated_client, db_session):
    from app.applications.rugby_teams.models.season import Season
    db_session.add_all([Season(name="2024-2025"), Season(name="2025-2026")])
    db_session.commit()

    response = authenticated_client.get("/api/v1/rugby-teams/seasons")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2


def test_read_seasons_with_pagination(authenticated_client, db_session):
    from app.applications.rugby_teams.models.season import Season
    for name in ["2023-2024", "2024-2025", "2025-2026"]:
        db_session.add(Season(name=name))
    db_session.commit()

    response = authenticated_client.get("/api/v1/rugby-teams/seasons?skip=1&limit=1")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1


def test_read_season_by_id_found(authenticated_client, db_session):
    from app.applications.rugby_teams.models.season import Season
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    response = authenticated_client.get(f"/api/v1/rugby-teams/seasons/{season.id}")
    assert response.status_code == status.HTTP_200_OK
    assert response.json()["name"] == "2025-2026"


def test_read_season_by_id_not_found(authenticated_client):
    response = authenticated_client.get("/api/v1/rugby-teams/seasons/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "trouvée" in response.json()["detail"].lower()



