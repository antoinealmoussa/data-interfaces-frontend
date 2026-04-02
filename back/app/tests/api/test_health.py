from fastapi import status


def test_health_check(client):
    """Test GET / (health check endpoint)."""
    response = client.get("/")

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "ok"
    assert "message" in data
