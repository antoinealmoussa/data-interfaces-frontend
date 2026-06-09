import { Box, Button } from "@mui/material";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTeamAndSeason } from "../../hooks/useTeamAndSeason";
import { playerApi } from "../../api/playerApi";
import { GenericDataTable } from "../../components/common/GenericDataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { NotificationSnackbar } from "../../components/common/NotificationSnackbar";
import { PlayerModal } from "../../components/rugby-teams/player/PlayerModal";
import { PageGuard } from "../../components/common/PageGuard";
import type { Player, CreatePlayerDto } from "../../types/playerTypes";
import type { Column, Action } from "../../components/common/GenericDataTable";
import type { SnackbarState } from "../../types/uiTypes";

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

export const TeamManagement = () => {
  const { team, season, loading, error } = useTeamAndSeason();
  const queryClient = useQueryClient();
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    severity: "success",
    message: "",
  });
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);

  const {
    data: players = [],
    isLoading: playersLoading,
    error: playersError,
  } = useQuery({
    queryKey: ["players", team?.name],
    queryFn: () => playerApi.getByTeam(team!.name),
    enabled: !!team,
  });

  const invalidatePlayers = () =>
    queryClient.invalidateQueries({ queryKey: ["players", team?.name] });

  const createMutation = useMutation({
    mutationFn: (data: CreatePlayerDto) =>
      playerApi.create(team!.name, data),
    onSuccess: () => {
      invalidatePlayers();
      setSnackbar({
        open: true,
        severity: "success",
        message: "Joueur ajouté avec succès",
      });
      setModalMode(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreatePlayerDto) =>
      playerApi.update(team!.name, editingPlayer!.id, data),
    onSuccess: () => {
      invalidatePlayers();
      setSnackbar({
        open: true,
        severity: "success",
        message: "Joueur modifié avec succès",
      });
      setModalMode(null);
      setEditingPlayer(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => playerApi.delete(team!.name, deleteTarget!.id),
    onSuccess: () => {
      invalidatePlayers();
      setSnackbar({
        open: true,
        severity: "success",
        message: "Joueur supprimé avec succès",
      });
      setDeleteTarget(null);
    },
    onError: () => {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Erreur lors de la suppression",
      });
      setDeleteTarget(null);
    },
  });

  const handleCreate = async (data: CreatePlayerDto) => {
    createMutation.mutate(data);
  };
  const handleUpdate = async (data: CreatePlayerDto) => {
    updateMutation.mutate(data);
  };
  const handleDelete = async () => {
    deleteMutation.mutate();
  };

  const playerActions: Action<Player>[] = [
    {
      label: "Modifier",
      icon: <EditIcon />,
      onClick: (p) => {
        setEditingPlayer(p);
        setModalMode("edit");
      },
    },
    {
      label: "Supprimer",
      icon: <DeleteIcon />,
      color: "error",
      onClick: (p) => setDeleteTarget(p),
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
            onClick={() => setModalMode("create")}
          >
            Ajouter un joueur
          </Button>
        </Box>

        <GenericDataTable
          columns={playerColumns}
          rows={players}
          actions={playerActions}
          loading={playersLoading}
          error={
            playersError ? "Erreur lors du chargement des joueurs" : null
          }
          emptyMessage="Aucun joueur dans cette équipe"
          getRowId={(p) => p.id}
        />

        <PlayerModal
          open={modalMode !== null}
          mode={modalMode ?? "create"}
          player={editingPlayer}
          onSave={modalMode === "create" ? handleCreate : handleUpdate}
          onClose={() => {
            setModalMode(null);
            setEditingPlayer(null);
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
          onCancel={() => setDeleteTarget(null)}
        />

        <NotificationSnackbar
          open={snackbar.open}
          severity={snackbar.severity}
          message={snackbar.message}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        />
      </Box>
    </PageGuard>
  );
};
