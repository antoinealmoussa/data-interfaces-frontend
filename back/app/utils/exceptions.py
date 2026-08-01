class ResourceNotFoundError(Exception):
    """Classe mère des erreurs de ressource introuvable (mappée sur 404)."""


class TeamNotFoundError(ResourceNotFoundError):
    def __init__(self, team_name: str):
        self.team_name = team_name
        super().__init__(f"Équipe '{team_name}' introuvable")


class PlayerNotFoundError(ResourceNotFoundError):
    def __init__(self, player_id: int):
        self.player_id = player_id
        super().__init__(f"Joueur {player_id} introuvable")


class TournamentNotFoundError(ResourceNotFoundError):
    def __init__(self, tournament_id: int):
        self.tournament_id = tournament_id
        super().__init__(f"Tournoi {tournament_id} introuvable")


class CategoryNotFoundError(ResourceNotFoundError):
    def __init__(self, category_name: str):
        self.category_name = category_name
        super().__init__(f"Catégorie '{category_name}' introuvable")


class UserNotFoundError(ResourceNotFoundError):
    def __init__(self, user_id: int):
        self.user_id = user_id
        super().__init__(f"Utilisateur {user_id} introuvable")


class ApplicationNotFoundError(ResourceNotFoundError):
    def __init__(self, app_id: int):
        self.app_id = app_id
        super().__init__("Application non trouvée")


class MissingPlayersError(ResourceNotFoundError):
    def __init__(self, missing_ids: set[int]):
        self.missing_ids = missing_ids
        super().__init__(f"Joueurs non trouvés : {missing_ids}")


class InvalidRequestError(Exception):
    def __init__(self, message: str):
        super().__init__(message)


class ForbiddenError(Exception):
    def __init__(self, message: str = "Non autorisé"):
        super().__init__(message)
