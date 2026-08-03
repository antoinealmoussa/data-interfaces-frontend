import { Box, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PeopleIcon from "@mui/icons-material/People";
import { useTeamAndSeason } from "../../hooks/rugby-teams/useTeamAndSeason";
import { tournamentApi } from "../../api/rugby-teams/tournamentApi";
import { playerApi } from "../../api/rugby-teams/playerApi";
import { GenericDataTable } from "../../components/common/GenericDataTable";
import { PageGuard } from "../../components/common/PageGuard";
import { EntityCrudPage } from "../../components/common/EntityCrudPage";
import { TournamentModal } from "../../components/rugby-teams/tournament/TournamentModal";
import type {
  Tournament,
  CreateTournamentDto,
} from "../../types/rugby-teams/tournamentTypes";
import type { Column } from "../../components/common/GenericDataTable";
import type { PlayerSimple } from "../../types/rugby-teams/playerTypes";

interface PlayerStatsRow {
  id: number;
  name: string;
  total: number;
  [category: string]: number | string;
}

const TournamentManagement = () => {
  const { team, season, loading, error } = useTeamAndSeason();
  const [viewMode, setViewMode] = useState<"player" | "tournament">("player");
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  const { data: players = [] } = useQuery<PlayerSimple[]>({
    queryKey: ["tournament-players", team?.name],
    queryFn: () =>
      playerApi.getByTeam(team!.name).then((data) =>
        data.map((p) => ({
          id: p.id,
          name: p.name,
          category_names: p.category_names,
        })),
      ),
    enabled: !!team,
  });

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

  const cats = team?.categories ?? [];
  const categoryCols: Column<PlayerStatsRow>[] = cats.map((cat) => ({
    key: cat,
    label: cat,
  }));
  const playerColumns: Column<PlayerStatsRow>[] = [
    { key: "name", label: "Nom" },
    ...categoryCols,
    { key: "total", label: "Total" },
  ];

  return (
    <PageGuard
      loading={loading}
      error={
        error || (!team || !season ? "Équipe ou saison introuvable" : null)
      }
    >
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

        <EntityCrudPage<Tournament, CreateTournamentDto>
          queryKey={["tournaments", team?.name]}
          queryFn={() =>
            tournamentApi.getByTeam(team!.name).then((data) =>
              data
                .map((t) => ({
                  ...t,
                  player_names: [...t.player_names].sort((a, b) =>
                    a.localeCompare(b),
                  ),
                }))
                .sort((a, b) => b.id - a.id),
            )
          }
          createFn={(data) => tournamentApi.create(team!.name, data)}
          updateFn={(id, data) => tournamentApi.update(team!.name, id, data)}
          deleteFn={(id) => tournamentApi.delete(team!.name, id)}
          entityName="tournoi"
          enabled={!!team}
          columns={tournamentColumns}
          addButtonLabel="Ajouter un tournoi"
          addButtonIcon={<EmojiEventsIcon />}
          emptyMessage="Aucun tournoi dans cette équipe"
          loadingErrorMsg="Erreur lors du chargement des tournois"
          showContent={viewMode === "tournament"}
          onEntitiesChange={setTournaments}
          renderForm={({ open, mode, entity, onSave, onClose }) => (
            <TournamentModal
              open={open}
              mode={mode}
              tournament={entity}
              onSave={onSave}
              onClose={onClose}
              teamCategories={team?.categories ?? []}
              teamPlayers={players}
            />
          )}
        />

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
      </Box>
    </PageGuard>
  );
};

export default TournamentManagement;
