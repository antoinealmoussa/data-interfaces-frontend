from fastapi import APIRouter, Depends

from app.applications.dependencies import require_app_access
from app.applications.race_preparation.endpoints.races import router as races_router

router = APIRouter(
    dependencies=[Depends(require_app_access("race-preparation"))],
)

router.include_router(races_router, prefix="/races", tags=["Race - Preparation"])
