---
name: testing-conventions
description: Testing setup for Stravoska — Vitest + jsdom on frontend, pytest on backend, Docker-based execution
---

## Frontend (Vitest + Testing Library)

- Framework : Vitest, environnement jsdom, `globals: true` dans `vitest.config.ts`
- Bibliothèques : `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- Le module `axios` est mocké globalement via `vi.mock("axios")` dans `src/test/setupTests.ts`
  - Les appels HTTP utilisent `mockAxios.get` / `mockAxios.post` etc. directement
- Les tests API mockent `apiClient` (et non axios directement) via `vi.mock("../../api/client")`
- Les tests hooks mockent les modules API via `vi.mock("../../api/rugby-teams/teamApi")`
- Les tests sont dans `src/test/` en miroir de `src/`
- Exécution : `npm run test` ou `docker compose exec frontend npm run test`

### Organisation des tests frontend

Les tests suivent la même structure par application que le code source :

```
src/test/
├── api/
│   ├── client.test.ts               ← tests du client partagé
│   ├── config.test.ts               ← tests config
│   └── rugby-teams/
│       ├── teamApi.test.ts
│       ├── playerApi.test.ts
│       ├── tournamentApi.test.ts
│       └── trainingApi.test.ts
├── hooks/
│   ├── useAuth.test.tsx             ← hooks partagés
│   ├── useCrudManager.test.tsx
│   └── rugby-teams/
│       └── useTeamAndSeason.test.tsx
├── components/                      ← composants
├── pages/                           ← pages
└── types/                           ← types
```

### Pattern de mock pour les tests API rugby

```ts
// test/api/rugby-teams/teamApi.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockedClient = { get: vi.fn(), post: vi.fn() };
vi.mock("../../../api/client", () => ({ default: mockedClient }));

// Le chemin du mock remonte de test/api/rugby-teams/ → api/client
```

### Pattern de mock pour les tests hooks rugby

```ts
// test/hooks/rugby-teams/useTeamAndSeason.test.tsx
const mockUseParams = vi.fn();
vi.mock("react-router-dom", () => ({ useParams: mockUseParams }));

const mockedTeamApi = { getAll: vi.fn() };
vi.mock("../../../api/rugby-teams/teamApi", () => ({ teamApi: mockedTeamApi }));
```

## Backend (pytest)

- `asyncio_mode = "auto"` dans `pyproject.toml` — pas besoin de `@pytest.mark.asyncio`

### Tests par application

Les tests backend sont organisés par module applicatif :
- `back/app/applications/rugby_teams/tests/` — tests rugby-teams (endpoints, services, repositories)
- `back/app/tests/` — tests partagés (auth, users, token, config)

Lancement :
- `poetry run pytest app/` — tous les tests
- `poetry run pytest app/applications/rugby_teams/tests/` — rugby-teams uniquement
- `poetry run pytest app/tests/` — partagés uniquement

## Les deux ensemble

`./scripts/run_tests.sh` (exécute d'abord back puis front dans Docker)
