import {
  Box,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { useEffect, useState, useCallback, useMemo } from "react";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTeamAndSeason } from "../../hooks/useTeamAndSeason";
import { tournamentApi } from "../../api/tournamentApi";
import { playerApi } from "../../api/playerApi";
import { GenericDataTable } from "../../components/common/GenericDataTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { NotificationSnackbar } from "../../components/common/NotificationSnackbar";
import { TournamentModal } from "../../components/rugby-teams/tournament/TournamentModal";
import { PageGuard } from "../../components/common/PageGuard";
import type {
  Tournament,
  CreateTournamentDto,
} from "../../types/tournamentTypes";
import type { Column, Action } from "../../components/common/GenericDataTable";
import type { SnackbarState } from "../../types/uiTypes";




interface PlayerOption {
  id: number;
  name: string;
  category_names: string[];
}

export const TournamentManagement = () => {
  const { team, season, loading, error } = useTeamAndSeason();
  const [viewMode, setViewMode] = useState<"player" | "tournament">("player");
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

  interface PlayerStatsRow {
    id: number;
    name: string;
    total: number;
    [category: string]: number | string;
  }

  const playerStats = useMemo((): PlayerStatsRow[] => {
    return players.map((player) => {
      const counts: Record<string, number> = {};
      let total = 0;
      for (const tournament of tournaments) {
        if (tournament.player_names.includes(player.name)) {
          total++;
          const cat = tournament.category_name;
          counts[cat] = (counts[cat] ?? 0) + 1;
        }
      }
      return { id: player.id, name: player.name, total, ...counts };
    });
  }, [players, tournaments]);

  const categories = team?.categories ?? [];
  const playerColumns = useMemo((): Column<PlayerStatsRow>[] => {
    const categoryCols: Column<PlayerStatsRow>[] = categories.map((cat) => ({
      key: cat,
      label: cat,
    }));
    return [
      { key: "name", label: "Nom" },
      ...categoryCols,
      { key: "total", label: "Total" },
    ];
  }, [categories]);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    severity: "success",
    message: "",
  });
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(
    null,
  );
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
      setPlayers(
        res.data.map((p) => ({
          id: p.id,
          name: p.name,
          category_names: p.category_names,
        })),
      );
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

  return (
    <PageGuard loading={loading} error={error || (!team || !season ? "Équipe ou saison introuvable" : null)}>
      <Box>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newValue) => {
            if (newValue) setViewMode(newValue);
          }}
          size="small"
        >
          <ToggleButton value="player">
            <PeopleIcon sx={{ mr: 0.5 }} /> Joueurs
          </ToggleButton>
          <ToggleButton value="tournament">
            <EmojiEventsIcon sx={{ mr: 0.5 }} /> Tournois
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === "tournament" && (
        <>
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
          </Box>

          <GenericDataTable
            columns={tournamentColumns}
            rows={tournaments}
            actions={tournamentActions}
            loading={tournamentsLoading}
            error={tournamentsError}
            emptyMessage="Aucun tournoi dans cette équipe"
            getRowId={(t) => t.id}
          />
        </>
      )}

      {viewMode === "player" && (
        <GenericDataTable<PlayerStatsRow>
          columns={playerColumns}
          rows={playerStats}
          emptyMessage="Aucun joueur dans cette équipe"
          getRowId={(row) => row.id}
          defaultOrderBy="total"
          defaultOrder="desc"
        />
      )}

      <TournamentModal
        open={modalMode !== null}
        mode={modalMode ?? "create"}
        tournament={editingTournament}
        onSave={modalMode === "create" ? handleCreate : handleUpdate}
        onClose={() => {
          setModalMode(null);
          setEditingTournament(null);
        }}
        teamCategories={team?.categories ?? []}
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
    </PageGuard>
  );
};
