# Frontend — Stravoska

## Structure du projet

```
front/
├── public/                   # Images statiques (logo, WVA photos...)
├── src/
│   ├── api/                  # Services API (axios, endpoints)
│   ├── components/
│   │   ├── authentication/   # Connexion, inscription, routes protégées
│   │   ├── layout/           # Header, sidebar, markdown renderer
│   │   ├── rugby-teams/      # Sidebar équipes, formulaire création
│   │   └── ui/               # Composants réutilisables (DropdownMenu, SearchInput...)
│   ├── contexts/             # Contexte d'authentification
│   ├── hooks/                # Hooks personnalisés (useAuth, useLogout)
│   ├── pages/                # Pages complètes
│   │   ├── authentication/   # Login, register, logout
│   │   ├── bike-exploration/ # Placeholder
│   │   ├── management/       # Profil utilisateur
│   │   ├── race-preparation/ # Placeholder
│   │   └── rugby-teams/      # Gestion d'équipes
│   ├── test/                 # Tests unitaires (miroir de src/)
│   ├── theme/                # Thème MUI personnalisé
│   └── types/                # Types TypeScript partagés
├── index.html
├── vite.config.ts
├── vitest.config.ts
└── package.json
```

## Lancement

```bash
npm run dev        # Développement (port 5173)
npm run build      # Production (tsc + vite build)
npm run preview    # Prévisualisation du build
```

## Tests

```bash
npm test               # Mode CI
npm run test:ui        # Interface Vitest
npm run test:coverage  # Couverture
```

Stack : **Vitest** + **React Testing Library** + **jsdom**.
Les requêtes HTTP sont mockées avec `vi.mock("axios")`.

## Stack technique

| Technologie | Usage |
|-------------|-------|
| React 19 | UI |
| TypeScript 5.9 | Typage strict |
| Vite 7 | Build / dev server |
| MUI 7 | Design system |
| Axios | Requêtes HTTP |
| react-router-dom 7 | Routage |
| react-hook-form | Formulaires |
| react-markdown + rehype-raw | Rendus Markdown |
| @tanstack/react-query | Cache API (en place) |
