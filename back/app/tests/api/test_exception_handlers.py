from fastapi import status

from app.main import (
    category_not_found_handler,
    forbidden_handler,
    player_not_found_handler,
    team_not_found_handler,
    tournament_not_found_handler,
)
from app.utils.exceptions import (
    CategoryNotFoundError,
    ForbiddenError,
    PlayerNotFoundError,
    TeamNotFoundError,
    TournamentNotFoundError,
)


async def test_team_not_found_handler():
    response = await team_not_found_handler(None, TeamNotFoundError("test"))

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() == {"detail": "Équipe 'test' introuvable"}


async def test_player_not_found_handler():
    response = await player_not_found_handler(None, PlayerNotFoundError(42))

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() == {"detail": "Joueur 42 introuvable"}


async def test_tournament_not_found_handler():
    response = await tournament_not_found_handler(None, TournamentNotFoundError(7))

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() == {"detail": "Tournoi 7 introuvable"}


async def test_category_not_found_handler():
    response = await category_not_found_handler(None, CategoryNotFoundError("Mixte"))

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert response.json() == {"detail": "Catégorie 'Mixte' introuvable"}


async def test_forbidden_handler():
    response = await forbidden_handler(None, ForbiddenError("Accès refusé"))

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert response.json() == {"detail": "Accès refusé"}
