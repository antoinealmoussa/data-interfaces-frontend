from fastapi import status


def test_search_topic_unauthenticated(client):
    """Test GET /api/v1/search/topic sans token."""
    response = client.get("/api/v1/search/topic", params={"query": "test"})

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_search_topic_empty_query(authenticated_client):
    """Test GET /api/v1/search/topic avec une requête vide."""
    response = authenticated_client.get("/api/v1/search/topic", params={"query": ""})

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT


def test_search_topic_missing_query(authenticated_client):
    """Test GET /api/v1/search/topic sans paramètre query."""
    response = authenticated_client.get("/api/v1/search/topic")

    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT
