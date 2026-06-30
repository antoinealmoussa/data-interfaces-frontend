from fastapi import APIRouter, Depends

from app.applications.dependencies import require_app_access
from app.applications.rugby_teams.endpoints.players import router as players_router
from app.applications.rugby_teams.endpoints.seasons import router as seasons_router
from app.applications.rugby_teams.endpoints.teams import router as teams_router
from app.applications.rugby_teams.endpoints.tournaments import router as tournaments_router
from app.applications.rugby_teams.endpoints.training import router as training_router

router = APIRouter(
    dependencies=[Depends(require_app_access("rugby-teams"))],
)

router.include_router(teams_router, prefix="/teams", tags=["Teams"])
router.include_router(seasons_router, prefix="/seasons", tags=["Seasons"])
router.include_router(players_router, tags=["Players"])
router.include_router(tournaments_router, tags=["Tournaments"])
router.include_router(training_router, tags=["Training"])
