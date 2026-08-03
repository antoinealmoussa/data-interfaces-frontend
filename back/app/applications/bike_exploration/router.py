from fastapi import APIRouter, Depends

from app.applications.bike_exploration.endpoints.activities import router as activities_router
from app.applications.bike_exploration.endpoints.cols import router as cols_router
from app.applications.dependencies import require_app_access

router = APIRouter(
    dependencies=[Depends(require_app_access("bike-exploration"))],
)

router.include_router(activities_router, prefix="/activities", tags=["Bike - Activities"])
router.include_router(cols_router, prefix="/cols", tags=["Bike - Cols"])
