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
│       └── services/                # Logique métier
│           ├── __init__.py
│           └── api_nationalize.py   # Appel à l'API publique
└── tests/
```
