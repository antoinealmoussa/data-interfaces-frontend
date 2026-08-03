import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { teamApi } from "../../api/rugby-teams/teamApi";
import type { Team } from "../../types/rugby-teams/teamTypes";
import type { Season } from "../../types/rugby-teams/seasonTypes";

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

  const team = useMemo(() => {
    if (!teamName) return null;
    const decoded = decodeURIComponent(teamName);
    return teams.find((t) => t.name === decoded) ?? null;
  }, [teams, teamName]);

  const season = useMemo(() => {
    if (!team || !seasonName) return null;
    const decoded = decodeURIComponent(seasonName);
    return team.seasons.find((s) => s.name === decoded) ?? null;
  }, [team, seasonName]);

  return {
    team,
    season,
    teams,
    loading: isPending,
    error: queryError ? "Erreur lors du chargement des équipes" : null,
    refetch,
  };
};
