from fastapi import APIRouter
from app.api.v1.endpoints import users, search_topic, teams, seasons, players, token, tournaments

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(search_topic.router, prefix="/search", tags=["Search"])
api_router.include_router(teams.router, prefix="/teams", tags=["Teams"])
api_router.include_router(seasons.router, prefix="/seasons", tags=["Seasons"])
api_router.include_router(players.router, tags=["Players"])
api_router.include_router(token.router, prefix="/token", tags=["Token"])
api_router.include_router(tournaments.router, tags=["Tournaments"])
