from fastapi import APIRouter, Depends, Query

from app.core.token import get_current_active_user
from app.models.user import User
from app.schemas.search_topic import SearchTopicResponse
from app.services.search_topic_service import get_search_result

router = APIRouter()


@router.get("/topic", response_model=SearchTopicResponse)
async def search_topic(
    query: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_active_user),
) -> dict:
    result = await get_search_result(query)
    return {"text": result}
