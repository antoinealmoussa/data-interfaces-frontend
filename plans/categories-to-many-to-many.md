# Refactor catégories : de JSON column vers table many-to-many

## Objectif
Remplacer le stockage des catégories dans une colonne JSON de la table `team` par une table `category` dédiée avec une relation many-to-many via `team_category`.

## Périmètre
Les catégories sont **fixes** (5 valeurs connues) :
- `"Mixte"`, `"+35"`, `"Open masculin"`, `"Open féminin"`, `"+50"`

Elles sont pré-ensemencées en base par la migration et le service ne fait que les **résoudre** (pas de création à la volée). La validation Pydantic côté backend et la constante `TEAM_CATEGORIES` côté frontend garantissent que seules ces 5 valeurs circulent.

## Motivations
- Normalisation : éviter la redondance et les risques d'incohérence
- Requêtage : pouvoir interroger directement les équipes par catégorie sans parsing JSON
- Contrainte d'intégrité : les noms de catégories seront une vraie contrainte UNIQUE en base

## Modifications détaillées

### 1. Nouveaux modèles SQLAlchemy

**`back/app/models/category.py`**
```python
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.session import Base

class Category(Base):
    __tablename__ = "category"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)

    teams = relationship("Team", secondary="team_category", back_populates="categories")
```

**`back/app/models/team_category.py`**
```python
from sqlalchemy import Column, Integer, ForeignKey, PrimaryKeyConstraint
from app.db.session import Base

class TeamCategory(Base):
    __tablename__ = "team_category"

    team_id = Column(Integer, ForeignKey("team.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("category.id", ondelete="CASCADE"), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint("team_id", "category_id"),
    )
```

**Les `ForeignKey` avec `ondelete="CASCADE"`** garantissent que la suppression d'une équipe supprime ses associations dans `team_category`, et que la suppression d'une catégorie supprime aussi ses associations — même en cas de requête SQL brute hors ORM.

### 2. Modèle modifié

**`back/app/models/team.py`**
- Supprimer l'import `JSON` (plus besoin)
- Supprimer `categories = Column(JSON, nullable=False)`
- Ajouter une relation many-to-many vers `Category` :
  ```python
  categories = relationship("Category", secondary="team_category", back_populates="teams")
  ```
- Garder `__tablename__ = "team"` et les autres relations inchangées (y compris `season`)

### 3. Schéma Pydantic

**`back/app/schemas/team.py`**
- `categories` reste `List[str]` dans les schemas d'entrée/sortie (l'API ne change pas)
- Le validator `validate_categories` reste inchangé (vérifie les 5 valeurs autorisées)
- Au moment de la sérialisation via `model_validate`, la relation `categories` (liste d'objets `Category`) sera transformée en `List[str]` → nécessite un `model_validator` ou un serializer personnalisé

  Deux options :
  - **Option A (recommandée)** : Surcharger `model_validate` dans `ApiReturnTeam` pour extraire les noms depuis la relation :
    ```python
    @classmethod
    def model_validate(cls, obj):
        data = {
            "id": obj.id,
            "name": obj.name,
            "categories": [c.name for c in obj.categories],
            "user_id": obj.user_id,
            "seasons": [ApiReturnSeason.model_validate(s) for s in obj.seasons],
        }
        return cls(**data)
    ```
  - **Option B** : Utiliser un serializer Pydantic ou une propriété sur le modèle

### 4. Service

**`back/app/services/team_service.py`**
- `create_team` : au lieu de passer `categories=team_in.categories` (liste de strings), il faut résoudre les objets `Category` existants (les catégories sont pré-ensemencées en base, pas de création à la volée) et les assigner à la relation :
  ```python
  category_objs = db.query(Category).filter(
      Category.name.in_(team_in.categories)
  ).all()
  # Pas de vérification d'existence : la validation Pydantic garantit
  # que seules les 5 valeurs autorisées arrivent, et la migration
  # garantit qu'elles existent en base.

  db_team = Team(
      name=team_in.name,
      user_id=team_in.user_id,
      seasons=[season],
      categories=category_objs,
  )
  ```
- `delete_team` : `ON DELETE CASCADE` sur `team_category.team_id` se charge du nettoyage de la table d'association au niveau base. L'instruction `db.delete(team)` n'a donc plus besoin de `secondary` pour ça — le CASCADE fait le travail de manière fiable quel que soit le chemin de suppression.
- `get_teams_by_user`, `get_team_by_id`, etc. : les relations sont lazy, mais `ApiReturnTeam.model_validate` chargera `team.categories` → pas de problème.

### 5. API Endpoint

**`back/app/api/v1/endpoints/teams.py`**
- Aucune modification nécessaire : la délégation au service reste identique

### 6. Frontend

**`front/src/types/teamTypes.ts`**
- `TEAM_CATEGORIES` constant → peut être supprimée ou conservée comme référence côté UI
- `Team` et `CreateTeamDto` : `categories: TeamCategory[]` ne change PAS (l'API renvoie/reçoit toujours une liste de strings)
- Si on veut un jour que le frontend récupère la liste des catégories depuis un endpoint backend (`GET /categories`), on pourra ajouter une route dédiée — mais ce n'est pas dans le scope de ce plan.

### 7. Migration SQL

#### Migration 006 : Création des tables catégories et migration des données

**`migrations/006_create-category-and-team-category.sql`**

```sql
-- 1. Créer la table category
CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Créer la table team_category (jointure) avec CASCADE
CREATE TABLE team_category (
    team_id INTEGER NOT NULL REFERENCES team(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES category(id) ON DELETE CASCADE,
    PRIMARY KEY (team_id, category_id)
);

-- 3. Ensemencer les 5 catégories fixes
INSERT INTO category (name) VALUES
    ('Mixte'),
    ('+35'),
    ('Open masculin'),
    ('Open féminin'),
    ('+50');

-- 4. Lier chaque équipe à ses catégories dans team_category
--    to_json() fonctionne que la colonne categories soit TEXT[] ou JSON
INSERT INTO team_category (team_id, category_id)
SELECT t.id, c.id
FROM team t
CROSS JOIN LATERAL json_array_elements_text(to_json(t.categories)) AS cat_name
JOIN category c ON c.name = cat_name;

-- 5. Supprimer l'ancienne colonne categories
ALTER TABLE team DROP COLUMN categories;
```

**Note** : La migration 005 (`ALTER COLUMN categories TYPE JSON`) est conservée dans l'historique. Si elle a déjà été appliquée, la colonne est `JSON` → `to_json()` est un no-op sur `JSON` → la migration 006 fonctionne normalement. Si elle n'a pas été appliquée, la colonne est `TEXT[]` → `to_json()` la convertit correctement en JSON array. Les deux cas sont supportés.

**Remarque sur les catégories fixes** : L'étape 3 (`INSERT INTO category`) ensemence les 5 catégories. Si la base contient déjà des données, ces `INSERT` se feront avant l'étape 4 qui lie les équipes existantes — mais le `UNIQUE` sur `name` protège des doublons si la migration 006 était ré-exécutée. Les catégories existant dans `team.categories` mais ne faisant pas partie des 5 valeurs autorisées ne sont pas possibles (la validation Pydantic les rejette à la création).

#### Migration 007 : Ajout de ON DELETE CASCADE sur les FKs existantes

**`migrations/007_add_on_delete_cascade.sql`**

Actuellement, `team_season` et `team.user_id` n'ont pas de `ON DELETE CASCADE`. Pour uniformiser la robustesse :

```sql
-- Ajouter CASCADE sur team_season.team_id
ALTER TABLE team_season
DROP CONSTRAINT team_season_team_id_fkey,
ADD CONSTRAINT team_season_team_id_fkey
    FOREIGN KEY (team_id) REFERENCES team(id) ON DELETE CASCADE;

-- Ajouter CASCADE sur team_season.season_id
ALTER TABLE team_season
DROP CONSTRAINT team_season_season_id_fkey,
ADD CONSTRAINT team_season_season_id_fkey
    FOREIGN KEY (season_id) REFERENCES season(id) ON DELETE CASCADE;
```

**Note** : `team.user_id → user_stravoska.id` n'est **pas** inclus — la suppression d'un utilisateur ne devrait pas supprimer ses équipes sans avertissement (perte de données). Le comportement actuel (RESTRICT implicite) est conservé.

### 8. Conséquence sur le service `delete_team`

Avec `ON DELETE CASCADE` sur les deux tables d'association (`team_season` et `team_category`), le code actuel de `delete_team` fonctionne toujours mais sa dépendance au mécanisme `secondary` de l'ORM n'est plus nécessaire pour le nettoyage des associations.

La logique actuelle de vérification des saisons orphelines reste inchangée et nécessaire (le CASCADE ne fait que supprimer les lignes dans les tables d'association, pas les saisons elles-mêmes).

### 9. Tests à modifier

#### Schemas (`test_team_schema.py`)
- `categories` reste `List[str]` dans les schemas → les tests de validation Pydantic ne changent **PAS**
- 5 tests passent sans modification (`test_categories_valid`, `test_categories_empty`, `test_categories_none`, `test_categories_invalid_value`, `test_categories_mixed_case`)

#### Service (`test_team_service.py`)
- `test_create_team_success` ligne 103 : `assert result.categories == ["Mixte", "+35"]` → l'API retourne toujours une liste de strings via le serializer → **PAS de changement** si le serializer extrait les noms
- Tous les autres tests qui créent une équipe avec `categories=["Mixte"]` → inchangés, le schéma d'entrée est le même

#### API (`test_team_endpoints.py`)
- `test_create_team_success` ligne 106 : `assert data["categories"] == ["Mixte", "+35"]` → inchangé si la sortie est une liste de strings
- Autres tests API → inchangés (même format d'entrée/sortie)

#### Frontend
- `teamApi.test.ts` inchangé (même contrat API)
- `TeamCreationForm.tsx` inchangé (même format de formulaire)

### 10. Ordre d'implémentation

1. Créer `back/app/models/category.py`
2. Créer `back/app/models/team_category.py` (avec CASCADE)  
3. Modifier `back/app/models/team.py` (supprimer column JSON, ajouter relation)
4. Modifier `back/app/schemas/team.py` (ajouter serializer pour transformer `Category` en `str`)
5. Modifier `back/app/services/team_service.py` (résoudre les `Category` existantes dans `create_team`, pas de création)
6. Créer `migrations/006_create-category-and-team-category.sql`
7. Créer `migrations/007_add_on_delete_cascade.sql` (CASCADE sur `team_season`)
8. Lancer les tests et corriger les échecs
9. Vérifier la couverture de tests

### 11. Risques et points d'attention

- **Migration 005 conservée** : Elle reste dans l'historique et ne pose pas de problème — la migration 006 est compatible avec les deux états de colonne (`TEXT[]` ou `JSON`).
- **ON DELETE CASCADE** : Plus robuste que le mécanisme `secondary` de l'ORM car il agit au niveau base de données (résiste aux suppressions SQL brutes, aux sessions parallèles, etc.). Le `secondary` peut être conservé dans les relations SQLAlchemy (il est alors redondant mais inoffensif — l'ORM essaiera de supprimer, mais 0 lignes seront affectées si CASCADE a déjà fait le travail).
- **Performance** : La résolution des `Category` dans `create_team` utilise une seule query avec `IN_` (catégories pré-chargées en base). Négligeable.
- **Catégories fixes** : Le service ne crée plus de catégories à la volée. Si une validation Pydantic laisse passer une valeur invalide, le `NOT NULL` et le CASCADE ne poseront pas de problème mais la query `IN_` retournera une liste vide → l'équipe sera créée sans catégories. La validation Pydantic étant la première barrière, ce cas ne devrait pas arriver.
- **Contrat API** : L'API continue d'accepter et de retourner `categories` comme `List[str]`. Aucun changement côté consommateur.
