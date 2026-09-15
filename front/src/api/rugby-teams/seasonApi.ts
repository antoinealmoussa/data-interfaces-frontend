import apiClient, { teamPath } from "../client";
import { API_SEGMENTS } from "../endpoints";
import type { CreateSeasonDto } from "../../types/rugby-teams/seasonTypes";
import type { Team } from "../../types/rugby-teams/teamTypes";

export const seasonApi = {
  createForTeam: (teamName: string, data: CreateSeasonDto) =>
    apiClient
      .post<Team>(`${teamPath(teamName, API_SEGMENTS.seasons)}`, data)
      .then((r) => r.data),
};

export type SeasonApiType = typeof seasonApi;