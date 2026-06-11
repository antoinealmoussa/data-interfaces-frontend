# Stravoska

Application web de gestion d'équipes sportives.

---

## Architecture du monorepo

```
stravoska/
├── front/                        # Frontend React + TypeScript (Vite)
├── back/                         # API FastAPI (Python)
├── migrations/                   # Migrations SQL
├── scripts/                      # Scripts utilitaires (DB, tests)
├── plans/                        # Documents de conception
├── docker-compose.yml            # Orchestration Docker (4 services)
└── README.md
```

## Services Docker

| Service | Technologie | Port | Dépend de |
|---------|-------------|------|-----------|
| `frontend` | Node 22, Vite 7, React 19 | `5173` | `backend` |
| `backend` | Python 3.12, FastAPI, SQLAlchemy | `8000` | `db`, `migration` |
| `migration` | PostgreSQL 15-alpine (éphémère) | — | `db` |
| `db` | PostgreSQL 15-alpine | `5000` | — |

## Démarrage rapide

```bash
docker compose build
docker compose up
```

- Frontend : http://localhost:5173
- Backend (API) : http://localhost:8000 | docs : http://localhost:8000/docs
- Base de données : `localhost:5000`

## Organisation

### Frontend — `front/`

**Stack :** React 19, TypeScript, Vite 7, MUI 7, TanStack React Query, Axios, React Router 7

**Arbre des providers :**
```
AppThemeProvider (MUI)
└── QueryClientProvider (React Query)
    └── BrowserRouter (React Router)
        └── AuthProvider (contexte utilisateur)
            └── AppRoutes
                ├── Routes publiques (/login, /register)
                └── Routes privées (ProtecteRoute → App → Outlet)
                    ├── Routes standards
                    └── Routes dynamiques (selon les permissions)
```

### Backend — `back/`

**Stack :** Python 3.12, FastAPI, SQLAlchemy, PostgreSQL, Pydantic, pytest

**Architecture en couches :**
```
endpoints/ (validation, routing)
    ↓
services/ (logique métier)
    ↓
models/ + schemas/ (ORM + validation)
```

Points d'entrée API sous `/api/v1` : utilisateurs, équipes, saisons, joueurs, tournois, entraînement, recherche.

## Scripts

```bash
./scripts/run_tests.sh         # Front + Back
./scripts/run_front_tests.sh   # Frontend uniquement
./scripts/run_back_tests.sh    # Backend uniquement
./scripts/connect_db.sh        # Connexion PostgreSQL
./scripts/migrate.sh           # Migrations SQL
```
