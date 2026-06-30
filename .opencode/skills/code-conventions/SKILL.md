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

## Backend — Naming

- Les services sont des fonctions libres (pas de classes), premier paramètre `db: Session`
- Les schemas : `ApiCreate<Entity>` / `ApiReturn<Entity>` / `ApiUpdate<Entity>`
- Les endpoints FastAPI : fonctions avec type hints complets, docstrings optionnels
- Les repositories : classes héritant de `BaseRepository`, nommées `<Entity>Repository`
