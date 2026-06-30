# Stravoska — AGENTS.md

## Architecture

Monorepo avec deux packages isolés dans `/front` (React 19 + Vite 7) et `/back` (FastAPI + SQLAlchemy). Le développement se fait exclusivement via Docker Compose (4 services : `frontend`, `backend`, `migration`, `db`). L'API est servie sous `/api/v1`.

## Commandes

- **Lancer l'app** : `docker compose build && docker compose up`
- **Tests (les deux)** : `./scripts/run_tests.sh` (exécute back puis front dans Docker)
- **Tests front uniquement** : `./scripts/run_front_tests.sh` ou `docker compose exec frontend npm run test`
- **Tests back uniquement** : `./scripts/run_back_tests.sh` ou `docker compose exec backend poetry run pytest app/`
- **Tests partagés uniquement** : `docker compose exec backend poetry run pytest app/tests/`
- **Tests rugby-teams uniquement** : `docker compose exec backend poetry run pytest app/applications/rugby_teams/tests/`
- **Frontend** : `npm run dev`, `npm run build` (lance `tsc -b` puis `vite build`), `npm run lint`
- **Backend** : `poetry run pytest app/`, `poetry run ruff check .`, `poetry run mypy app/`
- **Migrations** : `./scripts/migrate.sh` (applique les fichiers `migrations/*.sql` séquentiellement)
- **DB** : `./scripts/connect_db.sh` (localhost:5000)

## Authentification

JWT stocké dans des cookies HttpOnly. Le backend utilise 2 cookies (`access_token` + `refresh_token`). Le frontend Axios interceptor tente un refresh automatique sur 401 et dispatche un event `auth:unauthorized` en cas d'échec. Le modèle User a un champ `token_version` pour la révocation.

## Frontend — Patterns

- **Provider tree** : AppThemeProvider → QueryClientProvider → BrowserRouter → AuthProvider → AppRoutes
- **Routes** : découpées en 3 groupes dans `routes.tsx` — publiques (`/login`, `/register`), privées standards (`/`, `/profile`), dynamiques (par application, chargées via `React.lazy()`)
- **API calls** : modules avec pattern plain-object (`export const teamApi = { getAll, create }`), utilisent `apiClient` (Axios avec cookies) et sont consommés via React Query
- **TypeScript** : `strict: true`, `verbatimModuleSyntax: true` → utiliser `import type` pour les types ; `erasableSyntaxOnly: true` → pas de `enum`, `namespace`, ou `parameter properties`
- **Vite proxy** : en dev, `/api` est proxyfié vers `VITE_PROXY_TARGET` (défaut `http://localhost:8000`). L'`apiClient` Axios utilise `VITE_BACKEND_API` (défaut `/api/v1`).
- **Tests** : Vitest + jsdom, axios mocké globalement dans `src/test/setupTests.ts`, tests miroirs de `src/` dans `src/test/`. Le setup filtre les warnings `"not wrapped in act"` et `"No routes matched location"` pour éviter le bruit.

## Backend — Patterns

- **Couches** : `endpoints/` (FastAPI routes) → `services/` (fonctions libres, pas de classes) → `repositories/` (classes héritant de `BaseRepository[ModelType, ReturnSchemaType]`)
- **Schemas** : convention `ApiCreate*` / `ApiReturn*`, certains override `model_validate` (ex: `ApiReturnTeam`)
- **Exceptions métier** : classes custom dans `utils/exceptions.py`, gérées par des `@app.exception_handler` dans `main.py`
- **Rate limiting** : dépendance `RateLimiter` (in-memory) sur les endpoints sensibles (`/login`)
- **Entraînement** : Strategy pattern dans `services/training/algorithms/`, enregistré via `registry.py`
- **Mistral AI** : intégré via `services/search_topic_service.py`
- **FastAPI** : `redirect_slashes=False` dans la création de l'app (comportement non défaut)
- **Poetry** : `package-mode = false` (ne pas utiliser `pip install`, uniquement `poetry install`)
- **pytest** : `asyncio_mode = "auto"` (pas besoin de `@pytest.mark.asyncio`)
- **Ruff** : `select = ["E", "F", "W", "I"]`, line-length 100
- **MyPy** : mode strict avec `ignore_missing_imports = true`

## Nommage des tables

- Les tables transverses (auth, applications, migrations) n'ont pas de préfixe
- Les tables métier sont préfixées par l'abréviation de l'application :
  - `rt_` pour rugby-teams (renommé via migration 011)
  - `be_` pour bike-exploration
  - `rp_` pour race-preparation

Patterns détaillés (API, code conventions, architecture, tests) dans `.opencode/skills/`.
