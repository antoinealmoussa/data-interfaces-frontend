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
│   ├── api_router.py         # Hub central des routeurs
│   ├── helpers.py            # Helpers HTTP
│   └── endpoints/            # Routes par domaine
│       ├── users.py
│       ├── teams.py
│       ├── seasons.py
│       ├── players.py
│       ├── tournaments.py
│       ├── training.py
│       ├── token.py
│       └── search_topic.py
├── core/                     # Config, logs, dépendances
├── db/                       # Session SQLAlchemy
├── models/                   # Modèles ORM
├── schemas/                  # Schémas Pydantic
├── services/                 # Logique métier
│   └── training/algorithms/  # Algorithmes d'entraînement (registry pattern)
├── prompts/                  # Prompts IA (Mistral)
├── utils/                    # Validateurs
└── tests/                    # Tests unitaires
    ├── api/
    ├── core/
    ├── schemas/
    ├── services/
    └── utils/
```

## Architecture en couches

```
endpoints/ (couche HTTP)
    ↓
services/ (logique métier)
    ↓
models/ + schemas/ (ORM + validation)
```

## Points d'entrée API

Tous sous `/api/v1`. Domaines couverts : utilisateurs, équipes, saisons, joueurs, tournois, distribution d'entraînement, recherche, rafraîchissement de token.

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
