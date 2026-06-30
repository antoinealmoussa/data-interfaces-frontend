---
name: stravoska-architecture
description: Describe the layered architecture of Stravoska for backend (endpoints/services/repositories) and frontend (provider tree, routing)
---

## Backend — Couches

`endpoints/` (FastAPI routes) → `services/` (fonctions libres `def service(db, ...)`, pas de classes) → `repositories/` (classes héritant de `BaseRepository[ModelType, ReturnSchemaType]`).

- Les services sont des fonctions au niveau module, pas des classes ni méthodes statiques
- Les repositories étendent `BaseRepository` et définissent `model_class` + `return_schema`
- Les schémas Pydantic suivent la convention `ApiCreate*` / `ApiReturn*`
- Certains schemas overriden `model_validate` pour transformer les relations ORM (ex: `ApiReturnTeam` extrait `categories.name` depuis l'objet SQLAlchemy)
- Les exceptions métier sont dans `app/utils/exceptions.py`, gérées via `@app.exception_handler` dans `main.py`
- Le rate limiter `RateLimiter` est une dépendance FastAPI in-memory

## Architecture modulaire

Le backend est structuré en modules applicatifs dans `back/app/applications/` :

- Chaque application (rugby-teams, bike-exploration, etc.) a son propre dossier
- Le dossier contient : models/, schemas/, services/, repositories/, endpoints/, training/, tests/
- Les modules sont enregistrés via `back/app/applications/registrar.py`
- Les routes de chaque module sont montées dans `api_router.py` avec préfixe `/rugby-teams` (ou nom de l'application)
- Le router FastAPI est importé directement par `registrar.py` depuis le module `router`, pas via `__init__.py` (évite les imports circulaires)

Modules partagés (hors applications) : auth, users, token, search_topic.

## Frontend — Provider Tree

```
AppThemeProvider (MUI)
└── QueryClientProvider (React Query)
    └── BrowserRouter (React Router)
        └── AuthProvider (contexte utilisateur)
            └── AppRoutes
                ├── Routes publiques (/login, /register)
                └── Routes privées (ProtectedRoute → App → Outlet)
                    ├── Routes standards (/, /profile)
                    └── Routes dynamiques (selon permissions utilisateur)
```

- Les pages sont chargées via `React.lazy()` dans `src/routes.tsx` — jamais d'import statique
- Les routes sont découpées en 3 groupes : publiques, privées standards, dynamiques (par nom d'application)
- Les API calls utilisent des modules plain-object : `export const teamApi = { getAll, create }`
- Consommées via TanStack React Query

## Frontend — Organisation par application

Les modules spécifiques à une application sont isolés dans des sous-dossiers :

```
src/
├── api/
│   ├── client.ts              ← partagé (Axios, intercepteurs, teamPath)
│   ├── config.ts               ← partagé
│   └── rugby-teams/
│       ├── teamApi.ts
│       ├── playerApi.ts
│       ├── tournamentApi.ts
│       └── trainingApi.ts
├── hooks/
│   ├── useAuth.ts              ← partagé
│   ├── useCrudManager.ts       ← partagé
│   └── rugby-teams/
│       └── useTeamAndSeason.ts
├── types/
│   └── rugby-teams/
│       ├── teamTypes.ts
│       ├── playerTypes.ts
│       ├── tournamentTypes.ts
│       └── seasonTypes.ts
├── pages/
│   └── rugby-teams/            ← pages spécifiques
├── components/
│   └── rugby-teams/            ← composants spécifiques
└── test/
    ├── api/
    │   └── rugby-teams/        ← tests API
    └── hooks/
        └── rugby-teams/        ← tests hooks
```

Les imports entre sous-dossiers remontent à la racine puis redescendent :
- `api/rugby-teams/teamApi.ts` → `../../client` (pour apiClient, teamPath)
- `hooks/rugby-teams/useTeamAndSeason.ts` → `../../api/rugby-teams/teamApi`
