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
