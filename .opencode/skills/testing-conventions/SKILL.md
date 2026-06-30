---
name: testing-conventions
description: Testing setup for Stravoska — Vitest + jsdom on frontend, pytest on backend, Docker-based execution
---

## Frontend (Vitest + Testing Library)

- Framework : Vitest, environnement jsdom, `globals: true` dans `vitest.config.ts`
- Bibliothèques : `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- Le module `axios` est mocké globalement via `vi.mock("axios")` dans `src/test/setupTests.ts`
  - Les appels HTTP utilisent `mockAxios.get` / `mockAxios.post` etc. directement
- Les tests sont dans `src/test/` en miroir de `src/`
- Exécution : `docker compose exec frontend npm run test`

## Backend (pytest)

- `asyncio_mode = "auto"` dans `pyproject.toml` — pas besoin de `@pytest.mark.asyncio`
- Exécution : `docker compose exec backend poetry run pytest app/tests`

## Les deux ensemble

`./scripts/run_tests.sh` (exécute d'abord back puis front dans Docker)
