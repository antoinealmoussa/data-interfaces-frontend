from fastapi import APIRouter
from app.api.v1.endpoints import users  # Importe tes différents endpoints

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["Utilisateurs"])
