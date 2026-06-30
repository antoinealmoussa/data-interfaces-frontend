# Frontend — Stravoska

Application React + TypeScript pour la gestion d'équipes sportives.

## Stack technique

| Technologie | Usage |
|-------------|-------|
| React 19 | UI |
| TypeScript | Typage |
| Vite 7 | Build / dev server |
| MUI 7 | Design system |
| Axios | Client HTTP |
| TanStack React Query | Cache API |
| React Router 7 | Routage |
| React Hook Form | Formulaires |
| react-markdown + rehype-raw | Rendu Markdown |
| @dnd-kit | Drag & drop |
| Vitest + RTL + jsdom | Tests |

## Arbre des providers

```
AppThemeProvider (thème MUI)
└── QueryClientProvider (React Query)
    └── BrowserRouter (React Router)
        └── AuthProvider (contexte utilisateur)
            └── AppRoutes
```

## Routage

Défini dans `src/components/authentication/AppRoutes.tsx` :
1. **Publiques** — `/login`, `/register`
2. **Privées standards** — `/` (Home), `/profile` (UserProfile)
3. **Privées dynamiques** — selon les applications de l'utilisateur (ex: `/rugby-teams/*`)

## Structure du projet

```
src/
├── api/                     # Clients HTTP
│   ├── client.ts            #   Axios, intercepteurs, helpers d'URL
│   ├── config.ts            #   Configuration
│   └── rugby-teams/         #   Modules API par application
├── components/
│   ├── authentication/      # LoginForm, RegisterForm, ProtectedRoute, AppRoutes
│   ├── common/              # FormModal, GenericDataTable, ConfirmDialog…
│   ├── layout/              # Header, GenericSidebar, MarkdownRenderer
│   ├── rugby-teams/         # Composants métier par application
│   └── ui/                  # DropdownMenu, SearchInput, LoadingSpinner…
├── contexts/                # AuthContext
├── hooks/                   # Hooks partagés (useAuth, useLogout…)
│   └── rugby-teams/         # Hooks par application
├── pages/                   # Pages (Home, authentication/, management/)
│   └── rugby-teams/         # Pages par application
├── test/                    # Tests (miroir de src/)
├── theme/                   # Thème MUI
├── types/                   # Types partagés
│   └── rugby-teams/         # Types par application
├── utils/                   # array.ts, error.ts, format.ts
├── App.tsx                  # Composant racine
├── main.tsx                 # Point d'entrée
└── routes.tsx               # Déclaration des routes
```

Chaque application (ex. `rugby-teams`) regroupe son propre code dans des sous-dossiers de `api/`, `hooks/`, `types/`, `components/` et `pages/`. Les modules d'infrastructure partagée (client Axios, AuthContext, hooks génériques) restent à la racine.

## Commandes (Docker)

Toutes les commandes s'exécutent dans le conteneur via Docker Compose.

```bash
# Développement
docker compose up frontend

# Lancer une commande dans le conteneur frontend
docker compose exec frontend npm run dev
docker compose exec frontend npm run build
docker compose exec frontend npm run lint
```

## Tests

```bash
docker compose exec frontend npm test
docker compose exec frontend npm run test:ui
docker compose exec frontend npm run test:coverage
```

Ou via le script dédié depuis la racine du projet :

```bash
./scripts/run_front_tests.sh
```
