from fastapi import APIRouter
from app.api.v1.endpoints import users
from app.api.v1.endpoints import user_applications
api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["Utilisateurs"])
api_router.include_router(user_applications.router,
                          prefix="/user-applications", tags=["Applications utilisateur"])
