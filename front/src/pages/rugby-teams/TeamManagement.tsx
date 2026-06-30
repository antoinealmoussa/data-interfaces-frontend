import { Box, Button } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTeamAndSeason } from "../../hooks/rugby-teams/useTeamAndSeason";
import { playerApi } from "../../api/rugby-teams/playerApi";
import { GenericDataTable } from "../../components/common/GenericDataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { NotificationSnackbar } from "../../components/common/NotificationSnackbar";
import { PlayerModal } from "../../components/rugby-teams/player/PlayerModal";
import { PageGuard } from "../../components/common/PageGuard";
import type { Player, CreatePlayerDto } from "../../types/rugby-teams/playerTypes";
import type { Column, Action } from "../../components/common/GenericDataTable";
import { useCrudManager } from "../../hooks/useCrudManager";

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

  const playerManager = useCrudManager<Player, CreatePlayerDto>({
    queryKey: ["players", team?.name],
    queryFn: () => playerApi.getByTeam(team!.name),
    createFn: (data) => playerApi.create(team!.name, data),
    updateFn: (id, data) => playerApi.update(team!.name, id, data),
    deleteFn: (id) => playerApi.delete(team!.name, id),
    entityName: "joueur",
    enabled: !!team,
  });

  const {
    entities: players,
    isLoading: playersLoading,
    error: playersError,
    modalMode,
    editingEntity: editingPlayer,
    deleteTarget,
    snackbar,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleCloseSnackbar,
    deleteMutation,
  } = playerManager;

  const playerActions: Action<Player>[] = [
    {
      label: "Modifier",
      icon: <EditIcon />,
      onClick: (p) => {
        playerManager.setEditingEntity(p);
        playerManager.setModalMode("edit");
      },
    },
    {
      label: "Supprimer",
      icon: <DeleteIcon />,
      color: "error",
      onClick: (p) => playerManager.setDeleteTarget(p),
    },
  ];

  return (
    <PageGuard
      loading={loading}
      error={
        error || (!team || !season ? "Équipe ou saison introuvable" : null)
      }
    >
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => playerManager.setModalMode("create")}
          >
            Ajouter un joueur
          </Button>
        </Box>

        <GenericDataTable
          columns={playerColumns}
          rows={players}
          actions={playerActions}
          loading={playersLoading}
          error={playersError ? "Erreur lors du chargement des joueurs" : null}
          emptyMessage="Aucun joueur dans cette équipe"
          getRowId={(p) => p.id}
        />

        <PlayerModal
          open={modalMode !== null}
          mode={modalMode ?? "create"}
          player={editingPlayer}
          onSave={modalMode === "create" ? handleCreate : handleUpdate}
          onClose={() => {
            playerManager.setModalMode(null);
            playerManager.setEditingEntity(null);
          }}
          teamCategories={team?.categories ?? []}
        />

        <ConfirmDialog
          open={deleteTarget !== null}
          title="Supprimer le joueur"
          message={`Êtes-vous sûr de vouloir supprimer ${deleteTarget?.name} ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          confirmColor="error"
          loading={deleteMutation.isPending}
          onConfirm={handleDelete}
          onCancel={() => playerManager.setDeleteTarget(null)}
        />

        <NotificationSnackbar
          open={snackbar.open}
          severity={snackbar.severity}
          message={snackbar.message}
          onClose={handleCloseSnackbar}
        />
      </Box>
    </PageGuard>
  );
};

export default TeamManagement;
