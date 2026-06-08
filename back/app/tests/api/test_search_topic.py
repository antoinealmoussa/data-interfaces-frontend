from unittest.mock import patch, Mock, AsyncMock
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


@patch("app.services.search_topic_service.httpx.AsyncClient")
def test_search_topic_success(mock_client, authenticated_client):
    """Test GET /api/v1/search/topic avec succès (Mistral mocké)."""
    mock_post_resp = Mock()
    mock_post_resp.raise_for_status.return_value = None
    mock_post_resp.json.return_value = {
        "choices": [{"message": {"content": "Réponse test de Mistral"}}]
    }

    async def mock_post(*args, **kwargs):
        return mock_post_resp

    mock_ctx = AsyncMock()
    mock_ctx.__aenter__.return_value.post = mock_post
    mock_client.return_value = mock_ctx

    response = authenticated_client.get(
        "/api/v1/search/topic", params={"query": "test"}
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "text" in data
    assert data["text"] == "Réponse test de Mistral"
