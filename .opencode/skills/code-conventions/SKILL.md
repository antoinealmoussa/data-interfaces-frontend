---
name: code-conventions
description: Code style and quality rules for Stravoska — TypeScript strict, Ruff, MyPy, naming conventions
---

## Frontend (TypeScript + React)

- `strict: true` dans `tsconfig.app.json` — tous les checks stricts activés
- `verbatimModuleSyntax: true` — utiliser `import type` pour les types, jamais `import { type Foo }` mélangé avec des valeurs
- `erasableSyntaxOnly: true` — pas de `enum`, pas de `namespace`, pas de `constructor parameter properties`
- `noUnusedLocals: true`, `noUnusedParameters: true`
- Lint : ESLint avec `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`
- Build : `npm run build` lance `tsc -b` (vérification types) puis `vite build`

## Backend (Python)

- Ruff : `select = ["E", "F", "W", "I"]`, `line-length = 100`
  - Lint : `poetry run ruff check .`
- MyPy : mode strict (`strict = true`), `ignore_missing_imports = true`, `warn_unused_ignores = true`
  - Vérification : `poetry run mypy app/`
- L'ordre des imports suit les règles I de Ruff (regroupés stdlib / tiers / local, triés alphabétiquement)

## Nommage des tables SQL

Les tables métier sont préfixées par l'abréviation de l'application :
- `rt_team`, `rt_player`, `rt_season` (rugby-teams)
- `be_*` (bike-exploration, futur)
- `rp_*` (race-preparation, futur)

Les tables transverses (`user_stravoska`, `application`, `user_application`)
n'ont pas de préfixe.

## Backend — Naming

- Les services sont des fonctions libres (pas de classes), premier paramètre `db: Session`
- Les schemas : `ApiCreate<Entity>` / `ApiReturn<Entity>` / `ApiUpdate<Entity>`
- Les endpoints FastAPI : fonctions avec type hints complets, docstrings optionnels
- Les repositories : classes héritant de `BaseRepository`, nommées `<Entity>Repository`
- Le router FastAPI d'une application est importé directement par `registrar.py`, pas via le `__init__.py` du module (évite les imports circulaires)

## Frontend — Organisation par application

Les modules frontend propres à une application sont dans des sous-dossiers dédiés :

- `src/api/rugby-teams/` — API calls rugby (teamApi, playerApi, tournamentApi, trainingApi)
- `src/hooks/rugby-teams/` — hooks rugby (useTeamAndSeason)
- `src/types/rugby-teams/` — types rugby (teamTypes, playerTypes, tournamentTypes, seasonTypes)

Les modules d'infrastructure partagée restent à la racine : `src/api/client.ts`, `src/api/config.ts`, `src/hooks/useAuth.ts`, `src/hooks/useCrudManager.ts`, etc.

### Imports

Quand on importe depuis un fichier dans un sous-dossier applicatif :
```ts
// depuis api/rugby-teams/teamApi.ts
import { apiClient, teamPath } from "../../client";
```

```ts
// depuis hooks/rugby-teams/useTeamAndSeason.ts
import { teamApi } from "../../api/rugby-teams/teamApi";
import type { TeamWithSeasons } from "../../types/rugby-teams/teamTypes";
```

### URLs API

Tous les endpoints rugby sont préfixés par `/rugby-teams/` :
- `/rugby-teams/teams` — CRUD équipes
- `/rugby-teams/teams/{teamName}/players` — joueurs d'une équipe
- `/rugby-teams/teams/{teamName}/tournaments` — tournois d'une équipe
- `/rugby-teams/teams/{teamName}/training/...` — entraînement d'une équipe

La fonction `teamPath(teamName, ...segments)` dans `client.ts` construit ces chemins automatiquement.
