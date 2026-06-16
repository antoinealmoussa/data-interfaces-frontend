from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException
from httpx import HTTPStatusError, RequestError

from app.services.search_topic_service import format_prompt, get_search_result


def test_format_prompt():
    result = format_prompt("rugby")
    assert "rugby" in result


@pytest.mark.asyncio
async def test_get_search_result_success():
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "choices": [{"message": {"content": "Voici le résultat"}}]
    }

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.return_value = mock_response
        result = await get_search_result("rugby")
        assert result == "Voici le résultat"


@pytest.mark.asyncio
async def test_get_search_result_http_429():
    mock_response = MagicMock()
    mock_response.status_code = 429

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.side_effect = HTTPStatusError(
            "Too Many Requests", request=MagicMock(), response=mock_response
        )
        with pytest.raises(HTTPException) as exc:
            await get_search_result("rugby")
        assert exc.value.status_code == 429
        assert "Trop de requêtes" in exc.value.detail


@pytest.mark.asyncio
async def test_get_search_result_http_401():
    mock_response = MagicMock()
    mock_response.status_code = 401

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.side_effect = HTTPStatusError(
            "Unauthorized", request=MagicMock(), response=mock_response
        )
        with pytest.raises(HTTPException) as exc:
            await get_search_result("rugby")
        assert exc.value.status_code == 401
        assert "Clé d'authentification" in exc.value.detail


@pytest.mark.asyncio
async def test_get_search_result_http_400():
    mock_response = MagicMock()
    mock_response.status_code = 400

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.side_effect = HTTPStatusError(
            "Bad Request", request=MagicMock(), response=mock_response
        )
        with pytest.raises(HTTPException) as exc:
            await get_search_result("rugby")
        assert exc.value.status_code == 400
        assert "Format de requête" in exc.value.detail


@pytest.mark.asyncio
async def test_get_search_result_http_unknown_status():
    mock_response = MagicMock()
    mock_response.status_code = 500

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.side_effect = HTTPStatusError(
            "Internal Server Error", request=MagicMock(), response=mock_response
        )
        with pytest.raises(HTTPException) as exc:
            await get_search_result("rugby")
        assert exc.value.status_code == 500
        assert "inattendue" in exc.value.detail


@pytest.mark.asyncio
async def test_get_search_result_request_error():
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_post.side_effect = RequestError("Connection failed")
        with pytest.raises(HTTPException) as exc:
            await get_search_result("rugby")
        assert exc.value.status_code == 503
        assert "Mistral" in exc.value.detail
