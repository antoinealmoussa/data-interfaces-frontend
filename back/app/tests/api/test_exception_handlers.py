import json

import pytest
from fastapi import status

from app.main import (
    forbidden_handler,
    invalid_request_handler,
    resource_not_found_handler,
)
from app.utils.exceptions import (
    ApplicationNotFoundError,
    CategoryNotFoundError,
    ForbiddenError,
    InvalidRequestError,
    MissingPlayersError,
    PlayerNotFoundError,
    TeamNotFoundError,
    TournamentNotFoundError,
    UserNotFoundError,
)


def _detail(response) -> dict:
    return json.loads(response.body)


@pytest.mark.parametrize(
    ("exc", "expected_detail"),
    [
        (TeamNotFoundError("test"), "Équipe 'test' introuvable"),
        (PlayerNotFoundError(42), "Joueur 42 introuvable"),
        (TournamentNotFoundError(7), "Tournoi 7 introuvable"),
        (CategoryNotFoundError("Mixte"), "Catégorie 'Mixte' introuvable"),
        (UserNotFoundError(3), "Utilisateur 3 introuvable"),
        (ApplicationNotFoundError(9), "Application non trouvée"),
        (MissingPlayersError({2, 3}), "Joueurs non trouvés : {2, 3}"),
    ],
)
async def test_resource_not_found_handler(exc, expected_detail):
    response = await resource_not_found_handler(None, exc)

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert _detail(response) == {"detail": expected_detail}


async def test_forbidden_handler():
    response = await forbidden_handler(None, ForbiddenError("Accès refusé"))

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert _detail(response) == {"detail": "Accès refusé"}


async def test_invalid_request_handler():
    response = await invalid_request_handler(None, InvalidRequestError("Donnée invalide"))

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert _detail(response) == {"detail": "Donnée invalide"}
