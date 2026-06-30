from fastapi import APIRouter, Depends

from app.applications.dependencies import require_app_access

# Transition : on réimporte depuis l'ancien emplacement
from app.api.v1.endpoints.teams import router as teams_router
from app.api.v1.endpoints.players import router as players_router
from app.api.v1.endpoints.seasons import router as seasons_router
from app.api.v1.endpoints.tournaments import router as tournaments_router
from app.api.v1.endpoints.training import router as training_router

router = APIRouter(
    dependencies=[Depends(require_app_access("rugby-teams"))],
)

router.include_router(teams_router, prefix="/teams", tags=["Teams"])
router.include_router(seasons_router, prefix="/seasons", tags=["Seasons"])
router.include_router(players_router, tags=["Players"])
router.include_router(tournaments_router, tags=["Tournaments"])
router.include_router(training_router, tags=["Training"])
