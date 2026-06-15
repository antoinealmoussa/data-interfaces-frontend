import time
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app.core.rate_limit import RateLimiter


@pytest.fixture
def mock_request():
    request = MagicMock()
    request.client.host = "127.0.0.1"
    return request


@pytest.mark.asyncio
async def test_rate_limiter_allows_first_request(mock_request):
    limiter = RateLimiter(max_requests=3, window_seconds=60)
    await limiter(mock_request)


@pytest.mark.asyncio
async def test_rate_limiter_allows_within_limit(mock_request):
    limiter = RateLimiter(max_requests=3, window_seconds=60)
    for _ in range(3):
        await limiter(mock_request)


@pytest.mark.asyncio
async def test_rate_limiter_exceeds_limit(mock_request):
    limiter = RateLimiter(max_requests=3, window_seconds=60)
    for _ in range(3):
        await limiter(mock_request)
    with pytest.raises(HTTPException) as exc:
        await limiter(mock_request)
    assert exc.value.status_code == 429


@pytest.mark.asyncio
async def test_rate_limiter_different_ips(mock_request):
    limiter = RateLimiter(max_requests=1, window_seconds=60)
    await limiter(mock_request)

    other_request = MagicMock()
    other_request.client.host = "192.168.1.1"
    await limiter(other_request)


@pytest.mark.asyncio
async def test_rate_limiter_window_expiry(mock_request):
    limiter = RateLimiter(max_requests=1, window_seconds=0)
    await limiter(mock_request)
    time.sleep(0.01)
    await limiter(mock_request)


@pytest.mark.asyncio
async def test_rate_limiter_unknown_client():
    limiter = RateLimiter(max_requests=1, window_seconds=60)
    request = MagicMock()
    request.client = None
    await limiter(request)
