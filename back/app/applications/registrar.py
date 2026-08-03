from dataclasses import dataclass

from fastapi import APIRouter
from sqlalchemy import MetaData


@dataclass(frozen=True)
class AppModule:
    """Instance d'un module applicatif enregistré dans le registrar."""

    name: str
    router: APIRouter
    metadata: MetaData | None = None
    migration_dir: str | None = None


_registered_apps: dict[str, AppModule] = {}


def register(app_module: AppModule) -> None:
    """Enregistre un module applicatif."""
    _registered_apps[app_module.name] = app_module


def get_app_router(app_name: str) -> APIRouter | None:
    """Retourne le router d'une application par son nom."""
    app_mod = _registered_apps.get(app_name)
    return app_mod.router if app_mod else None


def get_all_app_routers() -> list[tuple[str, APIRouter]]:
    """Retourne tous les routers enregistrés avec leur nom."""
    return [(name, mod.router) for name, mod in _registered_apps.items()]


def register_all_known() -> None:
    """Importe et enregistre tous les modules applicatifs connus.
    Appelé au démarrage dans api_router.py."""
    from app.applications.bike_exploration import (
        metadata as be_meta,
    )
    from app.applications.bike_exploration import (
        migration_dir as be_migration,
    )
    from app.applications.bike_exploration import (
        name as be_name,
    )
    from app.applications.bike_exploration.router import router as be_router

    register(
        AppModule(
            name=be_name,
            router=be_router,
            metadata=be_meta,
            migration_dir=be_migration,
        )
    )

    from app.applications.rugby_teams import (
        metadata as rugby_meta,
    )
    from app.applications.rugby_teams import (
        migration_dir as rugby_migration,
    )
    from app.applications.rugby_teams import (
        name as rugby_name,
    )
    from app.applications.rugby_teams.router import router as rugby_router

    register(
        AppModule(
            name=rugby_name,
            router=rugby_router,
            metadata=rugby_meta,
            migration_dir=rugby_migration,
        )
    )
