import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useTeamAndSeason } from "../../hooks/rugby-teams/useTeamAndSeason";
import { playerApi } from "../../api/rugby-teams/playerApi";
import { PageGuard } from "../../components/common/PageGuard";
import { EntityCrudPage } from "../../components/common/EntityCrudPage";
import { PlayerModal } from "../../components/rugby-teams/player/PlayerModal";
import type { Player, CreatePlayerDto } from "../../types/rugby-teams/playerTypes";
import type { Column } from "../../components/common/GenericDataTable";

const playerColumns: Column<Player>[] = [
  { key: "name", label: "Nom" },
  { key: "level", label: "Niveau", render: (v) => `Niveau ${v}` },
  {
    key: "sex",
    label: "Sexe",
    render: (v) => (v === "H" ? "Homme" : "Femme"),
  },
  { key: "position", label: "Poste" },
  {
    key: "category_names",
    label: "Catégories",
    render: (v) => (v as string[]).join(", "),
  },
];

const TeamManagement = () => {
  const { team, season, loading, error } = useTeamAndSeason();

  return (
    <PageGuard
      loading={loading}
      error={
        error || (!team || !season ? "Équipe ou saison introuvable" : null)
      }
    >
      <EntityCrudPage<Player, CreatePlayerDto>
        queryKey={["players", team?.name, season?.id]}
        queryFn={() => playerApi.getByTeam(team!.name, season!.id)}
        createFn={(data) => playerApi.create(team!.name, season!.id, data)}
        updateFn={(id, data) => playerApi.update(team!.name, season!.id, id, data)}
        deleteFn={(id) => playerApi.delete(team!.name, season!.id, id)}
        entityName="joueur"
        enabled={!!team && !!season}
        columns={playerColumns}
        addButtonLabel="Ajouter un joueur"
        addButtonIcon={<PersonAddIcon />}
        emptyMessage="Aucun joueur dans cette équipe"
        loadingErrorMsg="Erreur lors du chargement des joueurs"
        renderForm={({ open, mode, entity, onSave, onClose }) => (
          <PlayerModal
            open={open}
            mode={mode}
            player={entity}
            onSave={onSave}
            onClose={onClose}
            teamCategories={team?.categories ?? []}
          />
        )}
      />
    </PageGuard>
  );
};

export default TeamManagement;
