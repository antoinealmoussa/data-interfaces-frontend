from fastapi import APIRouter

from app.api.v1.endpoints import (
    search_topic,
    token,
    users,
)
from app.applications.registrar import register_all_known, get_all_app_routers

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(search_topic.router, prefix="/search", tags=["Search"])
api_router.include_router(token.router, prefix="/token", tags=["Token"])

register_all_known()
for _app_name, app_router in get_all_app_routers():
    api_router.include_router(app_router)
