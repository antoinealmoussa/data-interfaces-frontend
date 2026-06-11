from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.player import Player
from app.models.team import Team
from app.models.tournament import Tournament
from app.schemas.tournament import (
    ApiCreateTournament,
    ApiReturnTournament,
    ApiUpdateTournament,
)


def get_tournament_by_id(
    db: Session, tournament_id: int
) -> Tournament | None:
    return (
        db.query(Tournament)
        .filter(Tournament.id == tournament_id)
        .first()
    )


def get_tournaments_by_team(
    db: Session, team_name: str, skip: int = 0, limit: int = 100
) -> list[Tournament]:
    team = db.query(Team).filter(Team.name == team_name).first()
    if not team:
        raise HTTPException(status_code=404, detail="Équipe non trouvée")
    return (
        db.query(Tournament)
        .filter(Tournament.team_id == team.id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_tournament(
    db: Session,
    team_name: str,
    tournament_in: ApiCreateTournament,
) -> ApiReturnTournament:
    team = db.query(Team).filter(Team.name == team_name).first()
    if not team:
        raise HTTPException(status_code=404, detail="Équipe non trouvée")

    category = (
        db.query(Category)
        .filter(Category.name == tournament_in.category_name)
        .first()
    )
    if not category:
        raise HTTPException(
            status_code=404,
            detail=f"Catégorie '{tournament_in.category_name}' non trouvée",
        )

    players = (
        db.query(Player)
        .filter(
            Player.name.in_(tournament_in.player_names),
            Player.team_id == team.id,
        )
        .all()
    )
    if len(players) != len(tournament_in.player_names):
        raise HTTPException(
            status_code=404,
            detail="Certains joueurs n'existent pas dans cette équipe",
        )

    db_tournament = Tournament(
        name=tournament_in.name,
        category_id=category.id,
        team_id=team.id,
        players=players,
    )
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    return ApiReturnTournament.model_validate(db_tournament)


def update_tournament(
    db: Session,
    tournament_id: int,
    team_name: str,
    tournament_in: ApiUpdateTournament,
) -> ApiReturnTournament:
    tournament = get_tournament_by_id(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournoi non trouvé")

    team = db.query(Team).filter(Team.name == team_name).first()
    if not team or tournament.team_id != team.id:
        raise HTTPException(
            status_code=404, detail="Tournoi non trouvé dans cette équipe"
        )

    category = (
        db.query(Category)
        .filter(Category.name == tournament_in.category_name)
        .first()
    )
    if not category:
        raise HTTPException(
            status_code=404,
            detail=f"Catégorie '{tournament_in.category_name}' non trouvée",
        )

    players = (
        db.query(Player)
        .filter(
            Player.name.in_(tournament_in.player_names),
            Player.team_id == team.id,
        )
        .all()
    )
    if len(players) != len(tournament_in.player_names):
        raise HTTPException(
            status_code=404,
            detail="Certains joueurs n'existent pas dans cette équipe",
        )

    tournament.name = tournament_in.name
    tournament.category_id = category.id
    tournament.players = players
    db.commit()
    db.refresh(tournament)
    return ApiReturnTournament.model_validate(tournament)


def delete_tournament(
    db: Session, tournament_id: int, team_name: str
) -> None:
    tournament = get_tournament_by_id(db, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournoi non trouvé")

    team = db.query(Team).filter(Team.name == team_name).first()
    if not team or tournament.team_id != team.id:
        raise HTTPException(
            status_code=404, detail="Tournoi non trouvé dans cette équipe"
        )

    db.delete(tournament)
    db.commit()
