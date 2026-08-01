import apiClient from "../client";
import { API_PATHS } from "../endpoints";
import type { Team, CreateTeamDto } from "../../types/rugby-teams/teamTypes";

const TEAM_URL = API_PATHS.rugbyTeams.teams;

export const teamApi = {
  getAll: () => apiClient.get<Team[]>(TEAM_URL).then((r) => r.data),
  create: (team: CreateTeamDto) =>
    apiClient.post<Team>(TEAM_URL, team).then((r) => r.data),
};

export type TeamApiType = typeof teamApi;
