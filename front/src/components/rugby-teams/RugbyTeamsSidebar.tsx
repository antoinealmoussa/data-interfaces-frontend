import { GenericSidebar } from "../layout/GenericSidebar";
import { Groups, EmojiEvents, FitnessCenter } from "@mui/icons-material";
import { useState, useEffect, useMemo } from "react";
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

  const seasons = useMemo(() => {
    const seasonMap = new Map<number, Season>();
    teams.forEach(team => team.seasons.forEach(s => seasonMap.set(s.id, s)));
    return Array.from(seasonMap.values());
  }, [teams]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const teamsRes = await teamApi.getAll();
        setTeams(teamsRes.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (teams.length > 0 && !selectedTeamName) {
      const decodedTeamName = teamName ? decodeURIComponent(teamName) : null;
      const match = decodedTeamName
        ? teams.find((t) => t.name === decodedTeamName)
        : null;
      setSelectedTeamName(match ? match.name : teams[0].name);
    }
  }, [teams, teamName, selectedTeamName]);

  useEffect(() => {
    const currentTeam = teams.find((t) => t.name === selectedTeamName);
    const teamSeasons = currentTeam?.seasons ?? [];

    if (teamSeasons.length > 0 && !selectedSeasonName) {
      const decodedSeasonName = seasonName ? decodeURIComponent(seasonName) : null;
      const match = decodedSeasonName
        ? teamSeasons.find((s) => s.name === decodedSeasonName)
        : null;
      setSelectedSeasonName(match ? match.name : teamSeasons[0].name);
    }
  }, [selectedTeamName, teams, seasonName, selectedSeasonName]);

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
