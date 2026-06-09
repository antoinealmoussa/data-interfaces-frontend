import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { teamApi } from "../api/teamApi";
import type { Team } from "../types/teamTypes";
import type { Season } from "../types/seasonTypes";

interface UseTeamAndSeasonResult {
  team: Team | null;
  season: Season | null;
  teams: Team[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useTeamAndSeason = (): UseTeamAndSeasonResult => {
  const { teamName, seasonName } = useParams<{
    teamName: string;
    seasonName: string;
  }>();

  const {
    data: teams = [],
    isPending,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: () => teamApi.getAll(),
  });

  const decodedTeamName = teamName ? decodeURIComponent(teamName) : null;
  const decodedSeasonName = seasonName ? decodeURIComponent(seasonName) : null;

  const team = decodedTeamName
    ? (teams.find((t) => t.name === decodedTeamName) ?? null)
    : null;

  const season =
    team && decodedSeasonName
      ? (team.seasons.find((s) => s.name === decodedSeasonName) ?? null)
      : null;

  return {
    team,
    season,
    teams,
    loading: isPending,
    error: queryError ? "Erreur lors du chargement des équipes" : null,
    refetch,
  };
};
