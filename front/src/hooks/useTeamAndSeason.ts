import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { teamApi } from "../api/teamApi";
import type { Team } from "../types/teamTypes";
import type { Season } from "../types/seasonTypes";

interface UseTeamAndSeasonResult {
  team: Team | null;
  season: Season | null;
  teams: Team[];
  loading: boolean;
  error: string | null;
}

export const useTeamAndSeason = (): UseTeamAndSeasonResult => {
  const { teamName, seasonName } = useParams<{ teamName: string; seasonName: string }>();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true);
        const res = await teamApi.getAll();
        setTeams(res.data);
      } catch {
        setError("Erreur lors du chargement des équipes");
      } finally {
        setLoading(false);
      }
    };
    loadTeams();
  }, []);

  const decodedTeamName = teamName ? decodeURIComponent(teamName) : null;
  const decodedSeasonName = seasonName ? decodeURIComponent(seasonName) : null;

  const team = decodedTeamName
    ? teams.find((t) => t.name === decodedTeamName) ?? null
    : null;

  const season =
    team && decodedSeasonName
      ? team.seasons.find((s) => s.name === decodedSeasonName) ?? null
      : null;

  return { team, season, teams, loading, error };
};
