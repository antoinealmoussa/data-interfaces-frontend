import { GenericSidebar } from "../layout/GenericSidebar";
import { Groups, EmojiEvents, FitnessCenter } from "@mui/icons-material";
import { useState, useEffect, useMemo } from "react";
import { teamApi } from "../../api/teamApi";
import { useNavigate } from "react-router-dom";
import type { Team } from "../../types/teamTypes";
import type { Season } from "../../types/seasonTypes";
import type { SidebarItem } from "../../types/uiTypes";

const menuItems: SidebarItem[] = [
  { label: "Gestion d'équipe", path: "team-management", icon: <Groups /> },
  { label: "Tournoi", path: "tournament", icon: <EmojiEvents /> },
  { label: "Entraînement", path: "training", icon: <FitnessCenter /> },
];

export const RugbyTeamsSidebar = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
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

        if (teamsRes.data.length > 0 && !selectedTeamId) {
          setSelectedTeamId(teamsRes.data[0].id);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (seasons.length > 0 && !selectedSeasonId) {
      setSelectedSeasonId(seasons[0].id);
    }
  }, [seasons, selectedSeasonId]);

  const visibleItems =
    selectedTeamId && selectedSeasonId ? menuItems : [];

  return (
    <GenericSidebar
      items={visibleItems}
      teams={teams.map((t) => ({ id: t.id, name: t.name }))}
      seasons={seasons}
      selectedTeamId={selectedTeamId}
      selectedSeasonId={selectedSeasonId}
      onTeamChange={(teamId) => {
        setSelectedTeamId(teamId);
        if (selectedSeasonId) {
          navigate(
            `/rugby-teams/${teamId}/${selectedSeasonId}/team-management`,
          );
        }
      }}
      onSeasonChange={(seasonId) => {
        setSelectedSeasonId(seasonId);
        if (selectedTeamId) {
          navigate(
            `/rugby-teams/${selectedTeamId}/${seasonId}/team-management`,
          );
        }
      }}
    />
  );
};
