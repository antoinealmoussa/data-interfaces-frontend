import { GenericSidebar } from "../layout/GenericSidebar";
import {
  Groups,
  EmojiEvents,
  FitnessCenter,
  Add,
  AddToQueue,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTeamAndSeason } from "../../hooks/rugby-teams/useTeamAndSeason";
import type { Season } from "../../types/rugby-teams/seasonTypes";
import type { SidebarAction, SidebarItem } from "../../types/uiTypes";
import { useMemo, useCallback } from "react";

const menuItems: SidebarItem[] = [
  { label: "Gestion d'équipe", path: "team-management", icon: <Groups /> },
  { label: "Tournoi", path: "tournament", icon: <EmojiEvents /> },
  { label: "Entraînement", path: "training", icon: <FitnessCenter /> },
];

export const RugbyTeamsSidebar = () => {
  const { teamName, seasonName } = useParams<{
    teamName: string;
    seasonName: string;
  }>();
  const { teams } = useTeamAndSeason();
  const navigate = useNavigate();

  const seasons = useMemo(() => {
    const seasonMap = new Map<number, Season>();
    for (const team of teams) {
      for (const season of team.seasons) {
        seasonMap.set(season.id, season);
      }
    }
    return Array.from(seasonMap.values());
  }, [teams]);

  const selectedTeamName = teamName ? decodeURIComponent(teamName) : null;
  const selectedSeasonName = seasonName ? decodeURIComponent(seasonName) : null;

  const visibleItems = selectedTeamName && selectedSeasonName ? menuItems : [];

  const basePath = "/rugby-teams";

  const navigateTo = useCallback((team: string, season: string, subPath: string) => {
    navigate(
      `${basePath}/${encodeURIComponent(team)}/${encodeURIComponent(season)}/${subPath}`,
    );
  }, [navigate, basePath]);

  const createTeamAction = useMemo<SidebarAction>(
    () => ({
      label: "Créer une équipe",
      icon: <Add />,
      onClick: () => navigate(`${basePath}/team-creation`),
    }),
    [navigate],
  );

  const createSeasonAction = useMemo<SidebarAction>(() => {
    if (!selectedTeamName || !selectedSeasonName) {
      return { label: "Nouvelle saison", icon: <AddToQueue />, onClick: () => {} };
    }
    return {
      label: "Nouvelle saison",
      icon: <AddToQueue />,
      onClick: () => navigateTo(selectedTeamName, selectedSeasonName, "new-season"),
    };
  }, [selectedTeamName, selectedSeasonName, navigateTo]);

  const actions = useMemo(
    () => [createTeamAction, createSeasonAction],
    [createTeamAction, createSeasonAction],
  );

  return (
    <GenericSidebar
      items={visibleItems}
      teams={teams.map((t) => ({ id: t.id, name: t.name }))}
      seasons={seasons}
      selectedTeamName={selectedTeamName}
      selectedSeasonName={selectedSeasonName}
      basePath={basePath}
      actions={actions}
      onTeamChange={(name) => {
        if (selectedSeasonName) {
          navigateTo(name, selectedSeasonName, "team-management");
        }
      }}
      onSeasonChange={(name) => {
        if (selectedTeamName) {
          navigateTo(selectedTeamName, name, "team-management");
        }
      }}
    />
  );
};
