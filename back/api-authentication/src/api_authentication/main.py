from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from src.api_authentication.schemas import ApiReturnUser
import src.api_authentication.models as models
from src.api_authentication.database import Base, engine, get_db
from starlette import status
from typing import List


app = FastAPI()

# Configure le middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Remplace par l'URL de ton front
    allow_credentials=True,
    allow_methods=["*"],  # Autorise toutes les méthodes (GET, POST, etc.)
    allow_headers=["*"],  # Autorise tous les en-têtes
)

models.Base.metadata.create_all(bind=engine)


@app.get(
    "/users",
    response_model=List[ApiReturnUser],
    status_code=status.HTTP_200_OK
)
async def get_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()

    return users
