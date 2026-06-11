from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.player import Player
from app.models.team import Team
from app.schemas.player import ApiCreatePlayer, ApiReturnPlayer, ApiUpdatePlayer


def get_player_by_id(db: Session, player_id: int) -> Player | None:
    return db.query(Player).filter(Player.id == player_id).first()


def get_players_by_team(db: Session, team_name: str, skip: int = 0, limit: int = 100):
    team = db.query(Team).filter(Team.name == team_name).first()
    if not team:
        raise HTTPException(status_code=404, detail="Équipe non trouvée")

    return (
        db.query(Player)
        .filter(Player.team_id == team.id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def _resolve_categories(db: Session, category_names: list[str]) -> list[Category]:
    categories = db.query(Category).filter(Category.name.in_(category_names)).all()
    if len(categories) != len(category_names):
        found = {c.name for c in categories}
        missing = [n for n in category_names if n not in found]
        raise HTTPException(
            status_code=404,
            detail=f"Catégories non trouvées : {', '.join(missing)}",
        )
    return categories


def create_player(db: Session, team_name: str, player_in: ApiCreatePlayer) -> ApiReturnPlayer:
    team = db.query(Team).filter(Team.name == team_name).first()
    if not team:
        raise HTTPException(status_code=404, detail="Équipe non trouvée")

    categories = _resolve_categories(db, player_in.category_names)

    db_player = Player(
        name=player_in.name,
        level=player_in.level,
        sex=player_in.sex,
        position=player_in.position,
        team_id=team.id,
        categories=categories,
    )
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return ApiReturnPlayer.model_validate(db_player)


def update_player(
    db: Session, player_id: int, team_name: str, user_id: int,
    player_in: ApiUpdatePlayer,
) -> ApiReturnPlayer:
    player = get_player_by_id(db, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Joueur non trouvé")

    team = db.query(Team).filter(Team.name == team_name).first()
    if not team:
        raise HTTPException(status_code=404, detail="Équipe non trouvée")
    if player.team_id != team.id:
        raise HTTPException(status_code=404, detail="Joueur non trouvé dans cette équipe")
    if team.user_id != user_id:
        raise HTTPException(status_code=403, detail="Non autorisé")

    categories = _resolve_categories(db, player_in.category_names)

    player.name = player_in.name
    player.level = player_in.level
    player.sex = player_in.sex
    player.position = player_in.position
    player.categories = categories

    db.commit()
    db.refresh(player)
    return ApiReturnPlayer.model_validate(player)


def delete_player(db: Session, player_id: int, team_name: str, user_id: int) -> None:
    player = get_player_by_id(db, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Joueur non trouvé")

    team = db.query(Team).filter(Team.name == team_name).first()
    if not team:
        raise HTTPException(status_code=404, detail="Équipe non trouvée")
    if player.team_id != team.id:
        raise HTTPException(status_code=404, detail="Joueur non trouvé dans cette équipe")
    if team.user_id != user_id:
        raise HTTPException(status_code=403, detail="Non autorisé")

    db.delete(player)
    db.commit()
