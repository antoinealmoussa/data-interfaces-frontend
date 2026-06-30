# Backend Stravoska

API FastAPI modulaire pour l'application Stravoska.

## Stack technique

| Technologie | Usage |
|-------------|-------|
| Python 3.12 | Langage |
| FastAPI | Framework HTTP |
| SQLAlchemy | ORM |
| PostgreSQL 15 | Base de données |
| Pydantic v2 | Validation |
| pytest + httpx | Tests |
| Ruff | Linter |
| MyPy | Types |

## Structure du projet

```
app/
├── main.py                   # Initialisation FastAPI, CORS, inclusion routeurs
├── api/v1/
│   └── api_router.py         # Montage des routeurs par application
├── core/                     # Config, logs, dépendances
├── db/                       # Session SQLAlchemy
├── applications/             # Modules applicatifs autonomes
│   ├── registrar.py          # Enregistrement des applications
│   └── rugby_teams/          # Gestion d'équipes sportives
│       ├── models/
│       ├── schemas/
│       ├── services/         #   + training/algorithms/ (registry pattern)
│       ├── repositories/
│       ├── endpoints/
│       └── tests/
├── models/                   # Modèles partagés (user…)
├── schemas/                  # Schémas partagés
├── services/                 # Services partagés (auth, token…)
├── prompts/                  # Prompts IA (Mistral)
├── utils/                    # Validateurs, exceptions métier
└── tests/                    # Tests partagés (auth, users…)
```

Chaque application dans `applications/` est autonome : elle contient ses propres couches (endpoints → services → repositories), ses modèles ORM, ses schémas Pydantic et ses tests. Les modules partagés (auth, users, token) restent dans les dossiers racine.

## Architecture en couches

Par application :
```
endpoints/ (couche HTTP, validation)
    ↓
services/ (logique métier)
    ↓
repositories/ (accès base de données)
    ↑
models/ + schemas/ (ORM + validation)
```

## Points d'entrée API

Tous sous `/api/v1/{application}`. Domaines couverts : utilisateurs, authentification, token, et chaque application enregistrée (ex. `/api/v1/rugby-teams/teams`).

## Commandes (Docker)

Toutes les commandes s'exécutent dans le conteneur via Docker Compose.

```bash
# Développement
docker compose up backend

# Lancer une commande dans le conteneur backend
docker compose exec backend poetry run uvicorn app.main:app --reload
docker compose exec backend poetry run pytest app/tests
docker compose exec backend poetry run ruff check app/
docker compose exec backend poetry run mypy app/
```

## Migrations

Les migrations SQL brutes sont appliquées automatiquement au démarrage via le service `migration` de Docker Compose.

Pour exécuter les migrations manuellement :

```bash
docker compose up migration
```

Ou via le script dédié depuis la racine du projet :

```bash
./scripts/migrate.sh
```
