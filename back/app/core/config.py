from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Variables avec valeurs par défaut
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASS: str = "postgres"
    DB_NAME: str = "localdb"

    # Chargement automatique du fichier .env
    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()

# Ton URL de connexion se construit dynamiquement
DATABASE_URL = f"postgresql://{settings.DB_USER}:{settings.DB_PASS}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
