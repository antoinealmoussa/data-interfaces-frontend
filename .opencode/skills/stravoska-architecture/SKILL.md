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

## Backend — Responsabilités par couche

### Contrat comportemental

| Couche | Responsabilité | Jamais |
|--------|---------------|--------|
| **Endpoints** | HTTP : parser request, auth, appeler service, retourner réponse | `db.add()`, `db.commit()`, `repo.model_class()`, logique métier |
| **Services** | Business : ownership, validation, coordination repos, commits | Imports depuis d'autres endpoints |
| **Repositories** | Data access : CRUD, queries custom | Business rules, `if user_id != ...` |

### `BaseRepository.create()`

`BaseRepository` (dans `app/db/repository.py`) a déjà une méthode `create()` qui
accepte un Pydantic `BaseModel`, fait le `model_class(**fields)`, `db.add()`,
`db.commit()`, `db.refresh()` et retourne le `ApiReturn*` :

```python
# BaseRepository.create() — db/repository.py:39-49
def create(self, data: BaseModel, **extra_fields) -> ReturnSchemaType:
    model_data = {k: v for k, v in data.model_dump().items() if k in model_fields}
    db_obj = self.model_class(**model_data, **extra_fields)
    self.db.add(db_obj)
    self.db.commit()
    self.db.refresh(db_obj)
    return self.return_schema.model_validate(db_obj)
```

→ L'utiliser dans les services quand le input est un schema Pydantic.
→ Utiliser `model_class()` directement uniquement pour les imports de données
   (pas de schema Pydantic en entrée).

## Architecture modulaire

Le backend est structuré en modules applicatifs dans `back/app/applications/` :

- Chaque application (rugby-teams, bike-exploration, etc.) a son propre dossier
- Le dossier contient : models/, schemas/, services/, repositories/, endpoints/, tests/
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
- Consommés via TanStack React Query

## Frontend — Organisation par application

Les modules spécifiques à une application sont isolés dans des sous-dossiers :

```
src/
├── api/
│   ├── client.ts              ← partagé (Axios, intercepteurs, teamPath)
│   ├── config.ts               ← partagé
│   ├── rugby-teams/
│   │   ├── teamApi.ts
│   │   ├── playerApi.ts
│   │   ├── tournamentApi.ts
│   │   └── trainingApi.ts
│   └── bike-exploration/
│       └── bikeApi.ts
├── hooks/
│   ├── useAuth.ts              ← partagé
│   ├── useCrudManager.ts       ← partagé
│   ├── rugby-teams/
│   │   └── useTeamAndSeason.ts
│   └── bike-exploration/
│       └── useBikeExploration.ts
├── types/
│   ├── rugby-teams/
│   │   ├── teamTypes.ts
│   │   ├── playerTypes.ts
│   │   ├── tournamentTypes.ts
│   │   └── seasonTypes.ts
│   └── bike-exploration/
│       ├── colTypes.ts
│       └── activityTypes.ts
├── pages/
│   ├── rugby-teams/
│   └── bike-exploration/
├── components/
│   ├── rugby-teams/
│   └── bike-exploration/
└── test/
    ├── api/
    │   ├── rugby-teams/
    │   └── bike-exploration/
    └── hooks/
        └── rugby-teams/
```

Les imports entre sous-dossiers remontent à la racine puis redescendent :
- `api/rugby-teams/teamApi.ts` → `../../client` (pour apiClient, teamPath)
- `hooks/rugby-teams/useTeamAndSeason.ts` → `../../api/rugby-teams/teamApi`
