from fastapi import APIRouter, Depends, Query

from app.core.dependencies import get_current_active_user
from app.core.rate_limit import RateLimiter
from app.models.user import User
from app.schemas.search_topic import SearchTopicResponse
from app.services.search_topic_service import get_search_result

router = APIRouter()

search_limiter = RateLimiter(max_requests=5, window_seconds=60)


@router.get("/topic", response_model=SearchTopicResponse)
async def search_topic(
    query: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_active_user),
    _: None = Depends(search_limiter),
) -> dict:
    result = await get_search_result(query)
    return {"text": result}
