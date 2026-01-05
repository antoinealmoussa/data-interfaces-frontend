# Architecture du repo

```bash
app/
├── main.py              # Initialisation et inclusion des routeurs
├── api/
│   ├── v1/
│   │   ├── api_router.py # Point de ralliement de tous les sous-routeurs
│   │   └── endpoints/    # Les fichiers de routes par métier
│   │       ├── users.py
│   │       ├── races.py
│   │       └── stats.py
├── core/                # "Le cerveau" technique
│   ├── config.py        # Lecture des variables d'env (.env)
│   └── security.py      <-- ICI : Hashage, JWT, vérification de password
├── db/                  # L'infrastructure de données
│   ├── session.py       <-- ICI : Ton database.py (SessionLocal, engine)
│   └── base.py          # Import de tous les modèles pour Alembic
├── models/              # Définitions SQL (Shared ou par domaine)
│   ├── user.py
│   └── race.py
├── schemas/             # Pydantic (Validation) par domaine
│   ├── user.py
│   └── race.py
└── services/            # La "Logique Métier" (Le coeur du code)
    ├── user_service.py
    ├── race_service.py
    └── stats_service.py
```

# Création d'un service back en Python

## Initialisation d'un projet Poetry

```bash
poetry init
poetry add fastapi uvicorn sqlalchemy psycopg2-binary
```

# Interaction base de données

## Connexion via Docker

```bash
psql -h localhost -U postgres -d localdb
```

## Génération d'une migration

```bash
docker-compose exec backend poetry run alembic revision --autogenerate -m "create_user_stravoska_table"
```

## Exécution d'une migration

```bash
docker-compose exec backend poetry run alembic upgrade head
```

## Lancement des tests

```bash
docker-compose exec backend poetry run pytest app/tests
```
