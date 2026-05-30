import { Box, Typography, Button } from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTeamAndSeason } from "../../hooks/useTeamAndSeason";
import { playerApi } from "../../api/playerApi";
import { GenericDataTable } from "../../components/common/GenericDataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { NotificationSnackbar } from "../../components/common/NotificationSnackbar";
import { PlayerModal } from "../../components/rugby-teams/player/PlayerModal";
import type { Player, CreatePlayerDto } from "../../types/playerTypes";
import type { Column, Action } from "../../components/common/GenericDataTable";

const playerColumns: Column<Player>[] = [
  { key: "name", label: "Nom" },
  { key: "level", label: "Niveau", render: (v) => `Niveau ${v}` },
  { key: "sex", label: "Sexe", render: (v) => (v === "H" ? "Homme" : "Femme") },
  { key: "position", label: "Poste" },
  {
    key: "category_names",
    label: "Catégories",
    render: (v) => (v as string[]).join(", "),
  },
];

interface SnackbarState {
  open: boolean;
  severity: "success" | "error";
  message: string;
}

export const TeamManagement = () => {
  const { team, season, loading, error } = useTeamAndSeason();
  const [players, setPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playersError, setPlayersError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    severity: "success",
    message: "",
  });
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadPlayers = useCallback(async () => {
    if (!team) return;
    setPlayersLoading(true);
    setPlayersError(null);
    try {
      const res = await playerApi.getByTeam(team.name);
      setPlayers(res.data);
    } catch {
      setPlayersError("Erreur lors du chargement des joueurs");
    } finally {
      setPlayersLoading(false);
    }
  }, [team]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  const handleCreate = async (data: CreatePlayerDto) => {
    await playerApi.create(team!.name, data);
    await loadPlayers();
    setSnackbar({
      open: true,
      severity: "success",
      message: "Joueur ajouté avec succès",
    });
    setModalMode(null);
  };

  const handleUpdate = async (data: CreatePlayerDto) => {
    await playerApi.update(team!.name, editingPlayer!.id, data);
    await loadPlayers();
    setSnackbar({
      open: true,
      severity: "success",
      message: "Joueur modifié avec succès",
    });
    setModalMode(null);
    setEditingPlayer(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await playerApi.delete(team!.name, deleteTarget!.id);
      await loadPlayers();
      setSnackbar({
        open: true,
        severity: "success",
        message: "Joueur supprimé avec succès",
      });
      setDeleteTarget(null);
    } catch {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Erreur lors de la suppression",
      });
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
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

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  if (error || !team || !season) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          {error || "Équipe ou saison introuvable"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
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
        error={playersError}
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
        teamCategories={team.categories}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Supprimer le joueur"
        message={`Êtes-vous sûr de vouloir supprimer ${deleteTarget?.name} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        confirmColor="error"
        loading={deleting}
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
  );
};
