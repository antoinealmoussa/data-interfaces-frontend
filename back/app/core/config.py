from pydantic_settings import BaseSettings, SettingsConfigDict
from fastapi.security import OAuth2PasswordBearer
from typing import ClassVar


class Settings(BaseSettings):
    # Variables avec valeurs par défaut (development only)
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASS: str = "postgres"
    DB_NAME: str = "localdb"

    # JWT Configuration
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Cookie Configuration
    ACCESS_TOKEN_COOKIE_NAME: str = "access_token"
    ACCESS_TOKEN_COOKIE_HTTPONLY: bool = True
    ACCESS_TOKEN_COOKIE_SECURE: bool = True
    ACCESS_TOKEN_COOKIE_SAMESITE: str = "lax"
    ACCESS_TOKEN_COOKIE_PATH: str = "/"
    ACCESS_TOKEN_COOKIE_MAX_AGE: int = 60 * 30

    # Mistral AI
    MISTRAL_API_KEY: str = ""
    MISTRAL_API_URL: str = "https://api.mistral.ai/v1/chat/completions"
    MISTRAL_MODEL: str = "mistral-small"

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"

    # Logging
    LOG_LEVEL: str = "DEBUG"

    # Chargement automatique du fichier .env
    model_config = SettingsConfigDict(env_file=".env")

    # OAuth2 scheme
    oauth2_scheme: ClassVar = OAuth2PasswordBearer(tokenUrl="api/v1/users/login")


settings = Settings()

# Ton URL de connexion se construit dynamiquement
DATABASE_URL = f"postgresql://{settings.DB_USER}:{settings.DB_PASS}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
