# Architecture du repo

```bash
api-name-origin-probabilities/
├── pyproject.toml
├── poetry.lock
├── src/
│   └── api-name-origin-probabilities/
│       ├── __init__.py
│       ├── main.py                  # Point d'entrée FastAPI
│       ├── schemas.py               # Schémas Pydantic
│       ├── utils/                   # Fonctions réutilisables
│       |   ├── __init__.py
│       |   └── datetimes.py         # Transformations de dates
│       └── services/                # Logique métier
│           ├── __init__.py
│           └── get_economy_rss_feed.py   # Accès au flux rss public
└── tests/
```
