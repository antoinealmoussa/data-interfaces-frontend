from fastapi import APIRouter
from app.api.v1.endpoints import users, search_topic

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(search_topic.router, prefix="/search", tags=["Search"])
