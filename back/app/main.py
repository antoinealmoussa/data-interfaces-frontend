from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.api_router import api_router  # Import du hub central
from app.core.config import settings
from app.utils.exceptions import CategoryNotFoundError, ForbiddenError, PlayerNotFoundError, TeamNotFoundError, TournamentNotFoundError

app = FastAPI(
    title="Stravoska API",
    description="Backend modulaire avec routage centralisé",
    version="1.0.0",
    redirect_slashes=False
)

# --- CONFIGURATION DES CORS ---
# Indispensable pour que React (port 5173) puisse communiquer avec FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INCLUSION DU ROUTEUR GLOBAL ---
# Toutes les routes seront désormais sous /api/v1
app.include_router(api_router, prefix="/api/v1")


@app.exception_handler(TeamNotFoundError)
async def team_not_found_handler(request: Request, exc: TeamNotFoundError):
    return JSONResponse(status_code=404, content={"detail": str(exc)})

@app.exception_handler(PlayerNotFoundError)
async def player_not_found_handler(request: Request, exc: PlayerNotFoundError):
    return JSONResponse(status_code=404, content={"detail": str(exc)})

@app.exception_handler(TournamentNotFoundError)
async def tournament_not_found_handler(request: Request, exc: TournamentNotFoundError):
    return JSONResponse(status_code=404, content={"detail": str(exc)})

@app.exception_handler(CategoryNotFoundError)
async def category_not_found_handler(request: Request, exc: CategoryNotFoundError):
    return JSONResponse(status_code=404, content={"detail": str(exc)})

@app.exception_handler(ForbiddenError)
async def forbidden_handler(request: Request, exc: ForbiddenError):
    return JSONResponse(status_code=403, content={"detail": str(exc)})


@app.get("/")
def health_check() -> dict:
    return {"status": "ok", "message": "Stravoska API is running"}
