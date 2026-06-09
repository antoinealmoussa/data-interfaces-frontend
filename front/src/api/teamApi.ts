import apiClient from "./client";
import type { Team, CreateTeamDto } from "../types/teamTypes";

const TEAM_URL = "/teams";

export const teamApi = {
  getAll: () => apiClient.get<Team[]>(TEAM_URL).then((r) => r.data),
  getBySeason: (seasonId: number) =>
    apiClient.get<Team[]>(`${TEAM_URL}/by-season/${seasonId}`).then((r) => r.data),
  hasTeams: async (): Promise<boolean> => {
    try {
      const response = await apiClient.get<boolean>(`${TEAM_URL}/has-teams`);
      return response.data;
    } catch {
      return false;
    }
  },
  create: (team: CreateTeamDto) =>
    apiClient.post<Team>(TEAM_URL, team).then((r) => r.data),
};

export type TeamApiType = typeof teamApi;
