from typing import Protocol

from fastapi import APIRouter
from sqlalchemy import MetaData


class AppModule(Protocol):
    """Interface d'un module applicatif.

    Champs optionnels (None = pas encore séparé de la Base commune) :
    - metadata : utilisé en Phase 3 quand le module aura sa propre Base
    - migration_dir : utilisé en Phase 3 pour les migrations indépendantes
    """
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
    from app.applications.rugby_teams import module as rugby_teams_module
    register(rugby_teams_module)
    # Ajouter ici chaque nouveau module au fur et à mesure
