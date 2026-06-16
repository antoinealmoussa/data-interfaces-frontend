from app.core.config import Settings


def test_settings_default_values():
    settings = Settings(
        _env_file=None, DB_HOST="localhost", DB_PASS="postgres",
        SECRET_KEY="", MISTRAL_API_KEY="",
    )
    assert settings.DB_HOST == "localhost"
    assert settings.DB_PORT == 5432
    assert settings.ALGORITHM == "HS256"
    assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == 30
    assert settings.ACCESS_TOKEN_COOKIE_NAME == "access_token"
    assert settings.REFRESH_TOKEN_COOKIE_NAME == "refresh_token"
    assert settings.MISTRAL_MODEL == "mistral-small"
    assert settings.LOG_LEVEL == "DEBUG"
    assert settings.CORS_ORIGINS == "http://localhost:5173"


def test_settings_custom_values():
    settings = Settings(
        DB_HOST="prod-db",
        DB_PORT=5433,
        DB_USER="admin",
        DB_PASS="secret",
        DB_NAME="proddb",
        SECRET_KEY="my-secret-key",
    )
    assert settings.DB_HOST == "prod-db"
    assert settings.DB_PORT == 5433
    assert settings.DB_USER == "admin"
    assert settings.DB_PASS == "secret"
    assert settings.DB_NAME == "proddb"
    assert settings.SECRET_KEY == "my-secret-key"


def test_settings_cookie_max_age_computed():
    settings = Settings(
        _env_file=None, DB_HOST="localhost", DB_PASS="postgres",
        SECRET_KEY="", MISTRAL_API_KEY="",
    )
    assert settings.ACCESS_TOKEN_COOKIE_MAX_AGE == 60 * 30
    assert settings.REFRESH_TOKEN_COOKIE_MAX_AGE == 60 * 60 * 24 * 30
