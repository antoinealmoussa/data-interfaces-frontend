from fastapi import APIRouter, Depends, Query, HTTPException
from app.models.user import User
from app.core.token import get_current_active_user
from app.schemas.search_topic import SearchTopicResponse
from app.services.search_topic_service import get_search_result

router = APIRouter()


@router.get("/topic", response_model=SearchTopicResponse)
async def search_topic(
    query: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_active_user),
):
    result = await get_search_result(query)
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=result["status"], detail=result["error"])

    return {"text": result}
