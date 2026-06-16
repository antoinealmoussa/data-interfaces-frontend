class TeamNotFoundError(Exception):
    def __init__(self, team_name: str):
        self.team_name = team_name
        super().__init__(f"Équipe '{team_name}' introuvable")


class PlayerNotFoundError(Exception):
    def __init__(self, player_id: int):
        self.player_id = player_id
        super().__init__(f"Joueur {player_id} introuvable")


class TournamentNotFoundError(Exception):
    def __init__(self, tournament_id: int):
        self.tournament_id = tournament_id
        super().__init__(f"Tournoi {tournament_id} introuvable")


class CategoryNotFoundError(Exception):
    def __init__(self, category_name: str):
        self.category_name = category_name
        super().__init__(f"Catégorie '{category_name}' introuvable")


class ForbiddenError(Exception):
    def __init__(self, message: str = "Non autorisé"):
        super().__init__(message)
