# Plan : Endpoint DELETE `/api/v1/teams/{team_id}`

## Objectif

Ajouter un endpoint `DELETE` pour supprimer une équipe, avec les règles métier suivantes :

- **404** si l'équipe n'existe pas
- **403** si l'équipe n'appartient pas à l'utilisateur connecté
- **401** si l'utilisateur n'est pas authentifié
- **204** en cas de succès (pas de body)
- Les saisons liées à l'équipe sont supprimées si elles deviennent orphelines

---

## Fichiers à modifier

### 1. `back/app/services/team_service.py` — Fonction `delete_team`

Ajouter deux fonctions :

```python
def get_team_by_id(db: Session, team_id: int) -> Team | None:
    return db.query(Team).filter(Team.id == team_id).first()


def delete_team(db: Session, team_id: int, user_id: int) -> None:
    team = get_team_by_id(db, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Équipe non trouvée")
    if team.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Vous n'êtes pas autorisé à supprimer cette équipe",
        )

    # Supprimer les entrées de la table de jonction team_season
    db.query(TeamSeason).filter(TeamSeason.team_id == team_id).delete()

    # Supprimer les saisons devenues orphelines
    for season in team.seasons:
        remaining = (
            db.query(TeamSeason)
            .filter(TeamSeason.season_id == season.id)
            .count()
        )
        if remaining == 0:
            db.delete(season)

    db.delete(team)
    db.commit()
```

**Design choice** : les saisons sont en relation many-to-many avec les équipes via `team_season`. Plutôt que de supprimer aveuglément toutes les saisons liées (ce qui briserait d'autres équipes partageant la même saison), on supprime uniquement les saisons qui deviennent **orphelines** (plus aucune équipe ne les référence).

**Imports à ajouter** :

```python
from app.models.team_season import TeamSeason
from fastapi import HTTPException
```

---

### 2. `back/app/api/v1/endpoints/teams.py` — Nouvel endpoint

```python
@router.delete("/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(
    team_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> None:
    team_service.delete_team(db, team_id=team_id, user_id=current_user.id)
```

La route s'ajoute au `router` existant (prefixé `/teams` dans `api_router.py`), donc le chemin complet est `DELETE /api/v1/teams/{team_id}`.

---

### 3. `back/app/tests/services/test_team_service.py` — Nouveaux tests service

```python
def test_get_team_by_id_found(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_in = ApiCreateTeam(
        name="Mon équipe", categories=["Mixte"],
        user_id=test_user.id, season_name="2025-2026",
    )
    created = team_service.create_team(db_session, team_in)

    result = team_service.get_team_by_id(db_session, created.id)
    assert result is not None
    assert result.id == created.id


def test_get_team_by_id_not_found(db_session):
    result = team_service.get_team_by_id(db_session, 999)
    assert result is None


def test_delete_team_success(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_in = ApiCreateTeam(
        name="Mon équipe", categories=["Mixte"],
        user_id=test_user.id, season_name="2025-2026",
    )
    created = team_service.create_team(db_session, team_in)

    team_service.delete_team(db_session, created.id, test_user.id)

    assert team_service.get_team_by_id(db_session, created.id) is None
    # La saison orpheline est supprimée
    from app.services.season_service import get_season_by_id
    assert get_season_by_id(db_session, season.id) is None


def test_delete_team_not_found(db_session, test_user):
    with pytest.raises(HTTPException) as exc:
        team_service.delete_team(db_session, 999, test_user.id)
    assert exc.value.status_code == 404


def test_delete_team_forbidden(db_session, test_user):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_in = ApiCreateTeam(
        name="Mon équipe", categories=["Mixte"],
        user_id=test_user.id, season_name="2025-2026",
    )
    created = team_service.create_team(db_session, team_in)

    with pytest.raises(HTTPException) as exc:
        team_service.delete_team(db_session, created.id, 999)
    assert exc.value.status_code == 403


def test_delete_team_keeps_shared_season(db_session, test_user):
    """Deux équipes partagent la même saison → la suppression d'une seule ne supprime pas la saison."""
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team1_in = ApiCreateTeam(
        name="Équipe A", categories=["Mixte"],
        user_id=test_user.id, season_name="2025-2026",
    )
    team2_in = ApiCreateTeam(
        name="Équipe B", categories=["+35"],
        user_id=test_user.id, season_name="2025-2026",
    )
    team1 = team_service.create_team(db_session, team1_in)
    team_service.create_team(db_session, team2_in)

    team_service.delete_team(db_session, team1.id, test_user.id)

    from app.services.season_service import get_season_by_id
    assert get_season_by_id(db_session, season.id) is not None
```

**Import à ajouter** : `import pytest` et `from fastapi import HTTPException`.

---

### 4. `back/app/tests/api/test_team_endpoints.py` — Nouveaux tests d'API

```python
def test_delete_team_success(authenticated_client, test_user, db_session):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_data = {
        "name": "Mon équipe", "categories": ["Mixte"],
        "user_id": test_user.id, "season_name": "2025-2026",
    }
    create_resp = authenticated_client.post("/api/v1/teams", json=team_data)
    team_id = create_resp.json()["id"]

    response = authenticated_client.delete(f"/api/v1/teams/{team_id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Vérifier que l'équipe n'existe plus
    get_resp = authenticated_client.get("/api/v1/teams")
    assert len(get_resp.json()) == 0


def test_delete_team_not_found(authenticated_client):
    response = authenticated_client.delete("/api/v1/teams/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "trouvée" in response.json()["detail"].lower()


def test_delete_team_forbidden(authenticated_client, test_user, db_session):
    """Créer une équipe avec un utilisateur, tenter de la supprimer avec un autre."""
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_data = {
        "name": "Mon équipe", "categories": ["Mixte"],
        "user_id": test_user.id, "season_name": "2025-2026",
    }
    create_resp = authenticated_client.post("/api/v1/teams", json=team_data)
    team_id = create_resp.json()["id"]

    # Créer un second utilisateur et son client authentifié
    from app.schemas.user import ApiCreateUser
    from app.services import user_service
    other_user = user_service.create_user(
        db_session,
        ApiCreateUser(
            email="other@test.com", password="pass",
            first_name="Other", surname="User",
        ),
    )
    from app.core.token import create_access_token
    from fastapi.testclient import TestClient
    from app.main import app
    other_client = TestClient(app)
    token = create_access_token(
        data={"sub": other_user.email, "token_version": other_user.token_version},
    )
    other_client.cookies.set("access_token", token)

    response = other_client.delete(f"/api/v1/teams/{team_id}")
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_delete_team_unauthenticated(client):
    response = client.delete("/api/v1/teams/1")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_delete_team_removes_orphan_season(authenticated_client, test_user, db_session):
    season = Season(name="2025-2026")
    db_session.add(season)
    db_session.commit()

    team_data = {
        "name": "Mon équipe", "categories": ["Mixte"],
        "user_id": test_user.id, "season_name": "2025-2026",
    }
    create_resp = authenticated_client.post("/api/v1/teams", json=team_data)
    team_id = create_resp.json()["id"]

    authenticated_client.delete(f"/api/v1/teams/{team_id}")

    # La saison est devenue orpheline → supprimée
    response = authenticated_client.get("/api/v1/seasons")
    season_ids = [s["id"] for s in response.json()]
    assert season.id not in season_ids
```

---

## Résumé des modifications

| Fichier | Action |
|---|---|
| `back/app/services/team_service.py` | Ajout de `get_team_by_id()` et `delete_team()` |
| `back/app/api/v1/endpoints/teams.py` | Ajout de la route `DELETE /{team_id}` |
| `back/app/tests/services/test_team_service.py` | 6 nouveaux tests |
| `back/app/tests/api/test_team_endpoints.py` | 5 nouveaux tests |

### Cas testés

| Test | Code attendu |
|---|---|
| Suppression réussie | 204 |
| Équipe inexistante | 404 |
| Équipe d'un autre utilisateur | 403 |
| Non authentifié | 401 |
| Saison orpheline supprimée | Vérification DB |
| Saison partagée conservée | Vérification DB |
