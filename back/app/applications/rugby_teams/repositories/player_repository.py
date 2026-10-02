from app.applications.rugby_teams.models.category import Category
from app.applications.rugby_teams.models.player import Player
from app.applications.rugby_teams.models.player_team_season import PlayerTeamSeason
from app.applications.rugby_teams.schemas.player import ApiReturnPlayer, PlayerBase
from app.db.repository import BaseRepository


class PlayerRepository(BaseRepository[Player, ApiReturnPlayer]):
    model_class = Player
    return_schema = ApiReturnPlayer

    def get_by_team_and_season(
        self, team_id: int, season_id: int, skip: int = 0, limit: int = 100
    ) -> list[Player]:
        return (
            self.db.query(Player)
            .join(PlayerTeamSeason, PlayerTeamSeason.player_id == Player.id)
            .filter(
                PlayerTeamSeason.team_id == team_id,
                PlayerTeamSeason.season_id == season_id,
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_ids_in_team_and_season(
        self, player_ids: list[int], team_id: int, season_id: int
    ) -> list[Player]:
        return (
            self.db.query(Player)
            .join(PlayerTeamSeason, PlayerTeamSeason.player_id == Player.id)
            .filter(
                Player.id.in_(player_ids),
                PlayerTeamSeason.team_id == team_id,
                PlayerTeamSeason.season_id == season_id,
            )
            .all()
        )

    def get_by_names_in_team_and_season(
        self, names: list[str], team_id: int, season_id: int
    ) -> list[Player]:
        return (
            self.db.query(Player)
            .join(PlayerTeamSeason, PlayerTeamSeason.player_id == Player.id)
            .filter(
                Player.name.in_(names),
                PlayerTeamSeason.team_id == team_id,
                PlayerTeamSeason.season_id == season_id,
            )
            .all()
        )

    def has_membership(self, player_id: int, team_id: int, season_id: int) -> bool:
        """Le joueur est-il dans le roster (équipe, saison) ?"""
        return (
            self.db.query(PlayerTeamSeason)
            .filter(
                PlayerTeamSeason.player_id == player_id,
                PlayerTeamSeason.team_id == team_id,
                PlayerTeamSeason.season_id == season_id,
            )
            .first()
            is not None
        )

    def is_on_team(self, player_id: int, team_id: int) -> bool:
        """Le joueur a-t-il une membership avec l'équipe (toutes saisons confondues) ?"""
        return (
            self.db.query(PlayerTeamSeason)
            .filter(
                PlayerTeamSeason.player_id == player_id,
                PlayerTeamSeason.team_id == team_id,
            )
            .first()
            is not None
        )

    def create_player(
        self, data: PlayerBase, team_id: int, season_id: int, categories: list[Category]
    ) -> ApiReturnPlayer:
        """Crée la personne + sa membership (équipe, saison)."""
        player = Player(
            name=data.name,
            level=data.level,
            sex=data.sex,
            position=data.position,
            categories=categories,
        )
        self.db.add(player)
        self.db.flush()
        self.db.add(
            PlayerTeamSeason(
                player_id=player.id,
                team_id=team_id,
                season_id=season_id,
            )
        )
        self.db.commit()
        self.db.refresh(player)
        return ApiReturnPlayer.model_validate(player)

    def add_to_season(
        self, player_ids: list[int], team_id: int, season_id: int
    ) -> None:
        """Ajoute en masse les memberships (équipe, saison), sans doublons."""
        existing = {
            m.player_id
            for m in self.db.query(PlayerTeamSeason)
            .filter(
                PlayerTeamSeason.team_id == team_id,
                PlayerTeamSeason.season_id == season_id,
            )
            .all()
        }
        for pid in set(player_ids) - existing:
            self.db.add(
                PlayerTeamSeason(player_id=pid, team_id=team_id, season_id=season_id)
            )
        self.db.commit()

    def update_player(
        self, player: Player, data: PlayerBase, categories: list[Category]
    ) -> Player:
        player.name = data.name
        player.level = data.level
        player.sex = data.sex
        player.position = data.position
        player.categories = categories
        self.db.commit()
        self.db.refresh(player)
        return player

    def delete_player(self, player: Player, team_id: int, season_id: int) -> None:
        """Retire la membership (équipe, saison) ; supprime la personne si plus aucune."""
        self.db.query(PlayerTeamSeason).filter(
            PlayerTeamSeason.player_id == player.id,
            PlayerTeamSeason.team_id == team_id,
            PlayerTeamSeason.season_id == season_id,
        ).delete()
        self.db.flush()
        remaining = (
            self.db.query(PlayerTeamSeason)
            .filter(PlayerTeamSeason.player_id == player.id)
            .count()
        )
        if remaining == 0:
            self.db.delete(player)
        self.db.commit()
