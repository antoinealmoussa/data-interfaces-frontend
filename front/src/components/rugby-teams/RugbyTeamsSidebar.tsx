import { GenericSidebar } from "../layout/GenericSidebar";
import { Groups, EmojiEvents, FitnessCenter } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useTeamAndSeason } from "../../hooks/rugby-teams/useTeamAndSeason";
import type { Season } from "../../types/rugby-teams/seasonTypes";
import type { SidebarItem } from "../../types/uiTypes";
import { useMemo } from "react";

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

  return (
    <GenericSidebar
      items={visibleItems}
      teams={teams.map((t) => ({ id: t.id, name: t.name }))}
      seasons={seasons}
      selectedTeamName={selectedTeamName}
      selectedSeasonName={selectedSeasonName}
      onTeamChange={(name) => {
        if (selectedSeasonName) {
          navigate(
            `/rugby-teams/${encodeURIComponent(name)}/${encodeURIComponent(selectedSeasonName)}/team-management`,
          );
        }
      }}
      onSeasonChange={(name) => {
        if (selectedTeamName) {
          navigate(
            `/rugby-teams/${encodeURIComponent(selectedTeamName)}/${encodeURIComponent(name)}/team-management`,
          );
        }
      }}
    />
  );
};
