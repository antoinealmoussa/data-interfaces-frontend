import { GenericSidebar } from "../layout/GenericSidebar";
import { Groups, EmojiEvents, FitnessCenter } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { teamApi } from "../../api/teamApi";
import type { Team } from "../../types/teamTypes";
import type { Season } from "../../types/seasonTypes";
import type { SidebarItem } from "../../types/uiTypes";

const menuItems: SidebarItem[] = [
  { label: "Gestion d'équipe", path: "team-management", icon: <Groups /> },
  { label: "Tournoi", path: "tournament", icon: <EmojiEvents /> },
  { label: "Entraînement", path: "training", icon: <FitnessCenter /> },
];

export const RugbyTeamsSidebar = () => {
  const { teamName, seasonName } = useParams<{ teamName: string; seasonName: string }>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamName, setSelectedTeamName] = useState<string | null>(null);
  const [selectedSeasonName, setSelectedSeasonName] = useState<string | null>(null);
  const navigate = useNavigate();

  const seasons: Season[] = [];
  if (Array.isArray(teams)) {
    for (const team of teams) {
      for (const season of team.seasons) {
        if (!seasons.some((s) => s.id === season.id)) {
          seasons.push(season);
        }
      }
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const res = await teamApi.getAll();
        const teamsData = Array.isArray(res.data) ? res.data : [];
        setTeams(teamsData);

        const decodedTeam = teamName ? decodeURIComponent(teamName) : null;
        const matchTeam = decodedTeam
          ? teamsData.find((t) => t.name === decodedTeam)
          : null;
        const team = matchTeam ?? teamsData[0];

        const decodedSeason = seasonName ? decodeURIComponent(seasonName) : null;
        const matchSeason = decodedSeason
          ? team?.seasons.find((s) => s.name === decodedSeason)
          : null;
        const season = matchSeason ?? team?.seasons[0];

        setSelectedTeamName(team?.name ?? null);
        setSelectedSeasonName(season?.name ?? null);
      } catch (error) {
        console.error("Erreur lors du chargement des équipes:", error);
      }
    };
    init();
  }, [teamName, seasonName]);

  const visibleItems =
    selectedTeamName && selectedSeasonName ? menuItems : [];

  return (
    <GenericSidebar
      items={visibleItems}
      teams={teams.map((t) => ({ id: t.id, name: t.name }))}
      seasons={seasons}
      selectedTeamName={selectedTeamName}
      selectedSeasonName={selectedSeasonName}
      onTeamChange={(teamName) => {
        setSelectedTeamName(teamName);
        if (selectedSeasonName) {
          navigate(
            `/rugby-teams/${encodeURIComponent(teamName)}/${encodeURIComponent(selectedSeasonName)}/team-management`,
          );
        }
      }}
      onSeasonChange={(seasonName) => {
        setSelectedSeasonName(seasonName);
        if (selectedTeamName) {
          navigate(
            `/rugby-teams/${encodeURIComponent(selectedTeamName)}/${encodeURIComponent(seasonName)}/team-management`,
          );
        }
      }}
    />
  );
};
