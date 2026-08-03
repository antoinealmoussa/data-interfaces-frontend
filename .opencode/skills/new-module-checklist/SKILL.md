---
name: new-module-checklist
description: Checklist pour créer un nouveau module backend dans Stravoska — schemas, repos, services, endpoints
---

## Créer un nouveau module backend

Quand tu crées un nouveau module sous `back/app/applications/<module>/`,
suivre cet ordre exact :

### Étape 1 — Folder structure

```
<module>/
├── __init__.py          (name, router, metadata, migration_dir)
├── router.py            (APIRouter + include_router des sub-routers)
├── models/
│   ├── __init__.py      (re-export des modèles)
│   └── <entity>.py
├── schemas/
│   ├── __init__.py
│   └── <entity>.py
├── repositories/
│   ├── __init__.py
│   └── <entity>_repository.py
├── services/
│   ├── __init__.py
│   └── <entity>_service.py
├── endpoints/
│   ├── __init__.py
│   └── <entity>s.py
└── tests/
    ├── conftest.py
    └── test_<entity>_.py
```

### Étape 2 — Models

Dans `models/<entity>.py` :
- Table prefixée par l'abréviation de l'application (`rt_`, `be_`, `rp_`)
- Hérite de `Base` depuis `app.db.session`
- Relationships avec `back_populates`

### Étape 3 — Schemas

Pour **chaque entité**, créer les schemas requis :

| Schema | Obligatoire ? | Rôle |
|--------|--------------|------|
| `<Entity>Base` | Oui | Champs partagés + `@field_validator` sur chaque champ |
| `ApiCreate<Entity>` | Si endpoint POST | Ce que le client envoie à la création |
| `ApiUpdate<Entity>` | Si endpoint PUT/PATCH | Ce que le client modifie |
| `ApiReturn<Entity>` | Oui (toujours) | Ce que le client reçoit |

**Règle `model_validate`** : obligatoire quand les attributs ORM ne matchent pas 1:1
avec les champs du schema (flatten relations, renommage).

```python
# Quand ajouter model_validate :
# ORM obj.categories = [Category(...), ...]  →  schema categories = ["U18", "Senior"]
# ORM obj.seasons = [Season(...), ...]       →  schema seasons = [ApiReturnSeason(...)]

class ApiReturnTeam(TeamBase):
    id: int
    seasons: list[ApiReturnSeason]
    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def model_validate(cls, obj, **kwargs):
        data = {
            "id": obj.id,
            "name": obj.name,
            "categories": [c.name for c in obj.categories],
            "user_id": obj.user_id,
            "seasons": [ApiReturnSeason.model_validate(s) for s in obj.seasons],
        }
        return cls(**data)
```

### Étape 4 — Repositories

Dans `repositories/<entity>_repository.py` :

```python
from app.db.repository import BaseRepository

class <Entity>Repository(BaseRepository[<Model>, ApiReturn<Entity>]):
    model_class = <Model>
    return_schema = ApiReturn<Entity>

    # Méthodes custom si besoin
    def get_by_<domain>(self, ...) -> list[<Model>]:
        return self.get_many(...)
```

`BaseRepository` fournit déjà : `get_by_id()`, `get_many()`, `create()`, `update()`, `delete()`.
La méthode `create(data: BaseModel)` accepte un schema Pydantic et gère
`model_class(**fields)` + `db.add()` + `db.commit()` + `db.refresh()` automatiquement.

### Étape 5 — Services

Dans `services/<entity>_service.py` :
- Fonctions libres (pas de classes), premier param `db: Session`
- Toute la logique métier ici (ownership checks, validation, commits)
- Retourner `ApiReturn*` depuis les opérations d'écriture
- Instantier le repo à l'intérieur : `repo = <Entity>Repository(db)`

```python
from sqlalchemy.orm import Session

def create_<entity>(db: Session, data: ApiCreate<Entity>) -> ApiReturn<Entity>:
    repo = <Entity>Repository(db)
    return repo.create(data)

def delete_<entity>(db: Session, entity_id: int, user_id: int) -> None:
    repo = <Entity>Repository(db)
    entity = repo.get_by_id(entity_id)
    if not entity:
        raise NotFoundError()
    if entity.user_id != user_id:
        raise ForbiddenError()
    repo.delete(entity_id)
```

### Étape 6 — Endpoints

Dans `endpoints/<entity>s.py` :
- Imports : uniquement `schemas` + `services` (+ deps FastAPI)
- **JAMAIS** d'import repository
- **JAMAIS** de `db.add()`, `db.commit()`, `repo.model_class()`
- Corps de fonction : 3-5 lignes max

```python
from app.applications.<module>.services import <entity>_service

@router.get("", response_model=list[ApiReturn<Entity>>)
def list_<entity>s(db: Session = Depends(get_db)):
    return <entity>_service.get_all(db)

@router.post("", response_model=ApiReturn<Entity>, status_code=201)
def create_<entity>(data: ApiCreate<Entity>, db: Session = Depends(get_db)):
    return <entity>_service.create(db, data)
```

### Étape 7 — Router + Registrar

`router.py` : composé les sub-routers avec `require_app_access("<app-name>")`.
`registrar.py` : ajouter `register("<app-name>", router)` dans `register_all_known()`.

### Étape 8 — Tests

```
tests/
├── conftest.py                  ← fixtures partagées (db session, samples)
├── test_<entity>_endpoints.py   ← tests API
├── test_<entity>_service.py     ← tests unitaires service
└── test_<entity>_schema.py      ← tests validation schemas
```

### DO / DO NOT

```
DO:
- Hériter BaseRepository avec les generics [Model, ApiReturnSchema]
- Créer ApiCreate* pour chaque POST/PUT endpoint
- Override model_validate quand ORM ≠ schema
- Garder les endpoints minces : auth → service → serialize
- Utiliser repo.create(data) quand le input est un schema Pydantic

DO NOT:
- Appeler repo.model_class() dans un endpoint
- Appeler db.add() / db.commit() dans un endpoint
- Mettre de la logique métier (if/else domain) dans un endpoint
- Bypasser le repository depuis un service (requêtes raw dans services)
- Créer des schemas ApiCreate* pour des opérations qui n'en ont pas besoin
  (ex: import de données bulk, pas de création user via POST)
```
