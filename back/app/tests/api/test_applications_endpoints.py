from fastapi import status


def test_list_applications_public(client):
    response = client.get("/api/v1/applications")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    names = {app["name"] for app in data}
    assert "rugby-teams" in names
    assert "bike-exploration" in names
    assert "race-preparation" in names
    for app in data:
        assert set(app.keys()) == {"id", "name", "pretty_name"}
