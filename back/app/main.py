from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api_router import api_router  # Import du hub central

app = FastAPI(
    title="Stravoska API",
    description="Backend modulaire avec routage centralisé",
    version="1.0.0"
)

# --- CONFIGURATION DES CORS ---
# Indispensable pour que React (port 5173) puisse communiquer avec FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- INCLUSION DU ROUTEUR GLOBAL ---
# Toutes les routes seront désormais sous /api/v1
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def health_check():
    return {"status": "ok", "message": "Stravoska API is running"}
