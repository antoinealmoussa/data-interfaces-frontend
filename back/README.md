# Backend Stravoska

API FastAPI modulaire pour l'application Stravoska.

## Structure

```bash
app/
├── main.py                    # Initialisation FastAPI, CORS, inclusion routeur
├── api/
│   ├── v1/
│   │   ├── api_router.py      # Hub central de tous les routeurs
│   │   ├── helpers.py         # Helpers HTTP (set/delete cookies)
│   │   └── endpoints/         # Routes par domaine métier
│   │       ├── users.py
│   │       ├── teams.py
│   │       ├── seasons.py
│   │       └── search_topic.py
├── core/
│   ├── config.py              # Settings pydantic (.env)
│   ├── logging_config.py      # Configuration logging
│   ├── security.py            # Hashage, vérification mot de passe (bcrypt)
│   └── token.py               # JWT : création, validation, dépendance current_user
├── db/
│   └── session.py             # Engine SQLAlchemy + get_db
├── models/
│   ├── user.py
│   ├── team.py
│   ├── season.py
│   ├── team_season.py
│   ├── application.py
│   └── user_application.py
├── schemas/
│   ├── user.py
│   ├── team.py
│   ├── season.py
│   └── search_topic.py
├── services/
│   ├── user_service.py
│   ├── team_service.py
│   ├── season_service.py
│   └── search_topic_service.py
├── prompts/
│   └── search_topic_prompt.py
└── tests/
    ├── api/
    ├── core/
    └── services/
```

## Configuration

Copier `.env.example` vers `.env` et remplir les valeurs :

```bash
cp .env.example .env
```

Variables requises : `SECRET_KEY`, `MISTRAL_API_KEY`.

## Lancement

```bash
poetry install
poetry run uvicorn app.main:app --reload
```

## Tests

```bash
poetry run pytest app/tests
```

## Migrations

```bash
poetry run alembic revision --autogenerate -m "description"
poetry run alembic upgrade head
```
