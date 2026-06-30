from fastapi import status


def test_list_algorithms(authenticated_client):
    response = authenticated_client.get(
        "/api/v1/rugby-teams/teams/Mon equipe/training/algorithms"
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 2
    algo_ids = {a["id"] for a in data}
    assert "random" in algo_ids
    assert "balanced" in algo_ids


def test_list_algorithms_unauthenticated(client):
    response = client.get("/api/v1/rugby-teams/teams/Mon equipe/training/algorithms")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_distribute_unknown_algorithm(authenticated_client):
    payload = {
        "player_ids": [1, 2],
        "team_count": 2,
        "algorithm": "unknown",
    }
    response = authenticated_client.post(
        "/api/v1/rugby-teams/teams/Mon equipe/training/distribute", json=payload
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "inconnu" in response.json()["detail"].lower()


def test_distribute_unauthenticated(client):
    payload = {
        "player_ids": [1, 2],
        "team_count": 2,
        "algorithm": "random",
    }
    response = client.post("/api/v1/rugby-teams/teams/Mon equipe/training/distribute", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
