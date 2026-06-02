import { Box, Typography, Button, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState, useCallback } from "react";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTeamAndSeason } from "../../hooks/useTeamAndSeason";
import { tournamentApi } from "../../api/tournamentApi";
import { playerApi } from "../../api/playerApi";
import { GenericDataTable } from "../../components/common/GenericDataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { NotificationSnackbar } from "../../components/common/NotificationSnackbar";
import { TournamentModal } from "../../components/rugby-teams/tournament/TournamentModal";
import type { Tournament, CreateTournamentDto } from "../../types/tournamentTypes";
import type { Column, Action } from "../../components/common/GenericDataTable";

interface SnackbarState {
  open: boolean;
  severity: "success" | "error";
  message: string;
}

interface PlayerOption {
  id: number;
  name: string;
  category_names: string[];
}

export const TournamentManagement = () => {
  const { team, season, loading, error } = useTeamAndSeason();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(false);
  const [tournamentsError, setTournamentsError] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerOption[]>([]);

  const tournamentColumns: Column<Tournament>[] = [
    { key: "name", label: "Nom" },
    { key: "category_name", label: "Catégorie" },
    {
      key: "player_names",
      label: "Joueurs",
      sortable: false,
      render: (value) =>
        (value as string[]).length > 0 ? (value as string[]).join(", ") : "—",
    },
  ];
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    severity: "success",
    message: "",
  });
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Tournament | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadTournaments = useCallback(async () => {
    if (!team) return;
    setTournamentsLoading(true);
    setTournamentsError(null);
    try {
      const res = await tournamentApi.getByTeam(team.name);
      const sorted = res.data
        .map((t) => ({
          ...t,
          player_names: [...t.player_names].sort((a, b) => a.localeCompare(b)),
        }))
        .sort((a, b) => b.id - a.id);
      setTournaments(sorted);
    } catch {
      setTournamentsError("Erreur lors du chargement des tournois");
    } finally {
      setTournamentsLoading(false);
    }
  }, [team]);

  const loadPlayers = useCallback(async () => {
    if (!team) return;
    try {
      const res = await playerApi.getByTeam(team.name);
      setPlayers(res.data.map((p) => ({ id: p.id, name: p.name, category_names: p.category_names })));
    } catch {
      // Silently fail — players are optional for the form
    }
  }, [team]);

  useEffect(() => {
    loadTournaments();
    loadPlayers();
  }, [loadTournaments, loadPlayers]);

  const handleCreate = async (data: CreateTournamentDto) => {
    await tournamentApi.create(team!.name, data);
    await loadTournaments();
    setSnackbar({
      open: true,
      severity: "success",
      message: "Tournoi ajouté avec succès",
    });
    setModalMode(null);
  };

  const handleUpdate = async (data: CreateTournamentDto) => {
    await tournamentApi.update(team!.name, editingTournament!.id, data);
    await loadTournaments();
    setSnackbar({
      open: true,
      severity: "success",
      message: "Tournoi modifié avec succès",
    });
    setModalMode(null);
    setEditingTournament(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await tournamentApi.delete(team!.name, deleteTarget!.id);
      await loadTournaments();
      setSnackbar({
        open: true,
        severity: "success",
        message: "Tournoi supprimé avec succès",
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

  const tournamentActions: Action<Tournament>[] = [
    {
      label: "Modifier",
      icon: <EditIcon />,
      onClick: (t) => {
        setEditingTournament(t);
        setModalMode("edit");
      },
    },
    {
      label: "Supprimer",
      icon: <DeleteIcon />,
      color: "error",
      onClick: (t) => setDeleteTarget(t),
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
          mb: 1,
        }}
      >
        <Button
          variant="contained"
          startIcon={<EmojiEventsIcon />}
          onClick={() => setModalMode("create")}
        >
          Ajouter un tournoi
        </Button>
        <TextField
          size="small"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
            },
          }}
          sx={{ maxWidth: 280 }}
        />
      </Box>

      <GenericDataTable
        columns={tournamentColumns}
        rows={tournaments}
        actions={tournamentActions}
        loading={tournamentsLoading}
        error={tournamentsError}
        emptyMessage="Aucun tournoi dans cette équipe"
        getRowId={(t) => t.id}
        search={search}
        onSearchChange={setSearch}
      />

      <TournamentModal
        open={modalMode !== null}
        mode={modalMode ?? "create"}
        tournament={editingTournament}
        onSave={modalMode === "create" ? handleCreate : handleUpdate}
        onClose={() => {
          setModalMode(null);
          setEditingTournament(null);
        }}
        teamCategories={team.categories}
        teamPlayers={players}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Supprimer le tournoi"
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
