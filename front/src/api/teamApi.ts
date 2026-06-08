import axios from "axios";
import API_URLS from "./config";
import type { Team, CreateTeamDto } from "../types/teamTypes";

const TEAM_URL = `${API_URLS.backend}/teams`;

export const teamApi = {
  getAll: () => axios.get<Team[]>(TEAM_URL),
  getBySeason: (seasonId: number) => 
    axios.get<Team[]>(`${TEAM_URL}/by-season/${seasonId}`),
  hasTeams: async (): Promise<boolean> => {
    try {
      const response = await axios.get<boolean>(`${TEAM_URL}/has-teams`);
      return response.data;
    } catch {
      return false;
    }
  },
  create: (team: CreateTeamDto) => axios.post<Team>(TEAM_URL, team),
};
