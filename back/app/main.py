from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api_router import api_router  # Import du hub central
from app.core.config import settings
from app.models.user import User
from app.models.team import Team
from app.models.season import Season
from app.models.team_season import TeamSeason
from app.models.application import Application
from app.models.user_application import user_application

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


@app.get("/")
def health_check() -> dict:
    return {"status": "ok", "message": "Stravoska API is running"}
