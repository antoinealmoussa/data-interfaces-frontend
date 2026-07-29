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

## Backend — Logging

- Configurer le logging au démarrage via `setup_logging()` (`app/core/logging_config.py`)
- **FastAPI** : appeler `setup_logging()` dans `main.py` avant la création de l'instance `FastAPI`
- **Scripts standalone** : appeler `setup_logging()` dans le bloc `if __name__ == "__main__"`
- Logger pattern : `logger = logging.getLogger(__name__)` — les messages propagent vers le logger `"app"` configuré
- Niveau de log : contrôlé par la variable d'env `LOG_LEVEL` (défaut `DEBUG`)
- Jamais de `print()` pour du logging métier, toujours `logger.info()` / `logger.warning()` / etc.

## Nommage des tables SQL

Les tables métier sont préfixées par l'abréviation de l'application :
- `rt_team`, `rt_player`, `rt_season` (rugby-teams)
- `be_*` (bike-exploration)
- `rp_*` (race-preparation, futur)

Les tables transverses (`user_stravoska`, `application`, `user_application`)
n'ont pas de préfixe.

## Backend — Naming

- Les services sont des fonctions libres (pas de classes), premier paramètre `db: Session`
- Les schemas : `ApiCreate<Entity>` / `ApiReturn<Entity>` / `ApiUpdate<Entity>`
- Les endpoints FastAPI : fonctions avec type hints complets, docstrings optionnels
- Les repositories : classes héritant de `BaseRepository`, nommées `<Entity>Repository`
- Le router FastAPI d'une application est importé directement par `registrar.py`, pas via le `__init__.py` du module (évite les imports circulaires)

## Backend — Schema Checklist

Pour chaque entité, créer les schemas Pydantic requis :

| Schema | Quand le créer | Contenu |
|--------|---------------|---------|
| `<Entity>Base` | Toujours | Champs partagés + `@field_validator` sur chaque champ |
| `ApiCreate<Entity>` | Si endpoint POST existe | Champs que le client envoie à la création |
| `ApiUpdate<Entity>` | Si endpoint PUT/PATCH existe | Champs modifiables |
| `ApiReturn<Entity>` | Toujours | Champs retournés au client + `model_config = ConfigDict(from_attributes=True)` |

**`model_validate` override** : obligatoire quand le schema `ApiReturn*` contient des
champs qui ne correspondent pas aux attributs ORM 1:1. Cas typiques :
- Relations ORM → flatten en `list[str]` ou en schemas nested
- Renommage de champs (`obj.team.name` → `team_name`)

```python
# Exemple : ApiReturnTeam flatten les categories ORM en list[str]
@classmethod
def model_validate(cls, obj, **kwargs):
    data = {
        "id": obj.id,
        "name": obj.name,
        "categories": [c.name for c in obj.categories],
        "seasons": [ApiReturnSeason.model_validate(s) for s in obj.seasons],
    }
    return cls(**data)
```

## Backend — Endpoint vs Service

**Endpoints** — Couche HTTP uniquement :
- Parser la requête (params, body, auth)
- Appeler un service
- Retourner la réponse sérialisée
- **JAMAIS** : `db.add()`, `db.commit()`, `repo.model_class()`, logique métier if/else

**Services** — Toute la logique métier :
- Business rules (ownership checks, validation métier, cascading)
- Coordonner les repositories
- Appeler `db.commit()` quand nécessaire
- Retourner des schemas `ApiReturn*`

**Repositories** — Accès aux données :
- CRUD basique via `BaseRepository`
- Méthodes custom pour queries spécifiques
- Pas de logique métier

## Frontend — Organisation par application

Les modules frontend propres à une application sont dans des sous-dossiers dédiés :

- `src/api/rugby-teams/` — API calls rugby (teamApi, playerApi, tournamentApi, trainingApi)
- `src/api/bike-exploration/` — API calls vélo (bikeApi)
- `src/hooks/rugby-teams/` — hooks rugby (useTeamAndSeason)
- `src/hooks/bike-exploration/` — hooks vélo (useBikeExploration)
- `src/types/rugby-teams/` — types rugby (teamTypes, playerTypes, tournamentTypes, seasonTypes)
- `src/types/bike-exploration/` — types vélo (colTypes, activityTypes)

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
