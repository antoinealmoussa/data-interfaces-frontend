import { GenericSidebar } from "../layout/GenericSidebar";
import { Groups, EmojiEvents, FitnessCenter } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { teamApi } from "../../api/teamApi";
import { seasonApi } from "../../api/seasonApi";
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
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teamsRes, seasonsRes] = await Promise.all([
          teamApi.getAll(),
          seasonApi.getAll(),
        ]);
        setTeams(teamsRes.data);
        setSeasons(seasonsRes.data);

        if (teamsRes.data.length > 0 && !selectedTeamId) {
          setSelectedTeamId(teamsRes.data[0].id);
        }
        if (seasonsRes.data.length > 0 && !selectedSeasonId) {
          setSelectedSeasonId(seasonsRes.data[0].id);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };
    loadData();
  }, []);

  return (
    <GenericSidebar
      items={menuItems}
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
