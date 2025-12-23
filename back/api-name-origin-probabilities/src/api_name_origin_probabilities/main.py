from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from src.api_name_origin_probabilities.schemas import ApiNameOriginProbabilities
from src.api_name_origin_probabilities.services.api_nationalize import fetch_nationalize_api_data, remodel_data
import src.api_name_origin_probabilities.models as models
from src.api_name_origin_probabilities.database import Base, engine, get_db
from src.api_name_origin_probabilities.country import router as country_routes

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
    "/name_probabilites/{name}",
    response_model=ApiNameOriginProbabilities
)
async def get_name_probabilities(name: str, db: Session = Depends(get_db)):
    try:
        # 1. Appel à l'API publique
        nationalize_data = await fetch_nationalize_api_data(name)

        # 2. Remodelage des données
        remodeled = remodel_data(nationalize_data, db)

        # 3. Retourne le résultat
        return remodeled
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

app.include_router(country_routes)
