import axios from "axios";
import API_URLS from "./config";
import type { Tournament, CreateTournamentDto } from "../types/tournamentTypes";

const BASE_URL = `${API_URLS.backend}/teams`;

export const tournamentApi = {
  getByTeam: (teamName: string) =>
    axios.get<Tournament[]>(
      `${BASE_URL}/${encodeURIComponent(teamName)}/tournaments`,
    ),

  create: (teamName: string, data: CreateTournamentDto) =>
    axios.post<Tournament>(
      `${BASE_URL}/${encodeURIComponent(teamName)}/tournaments`,
      data,
    ),

  update: (teamName: string, tournamentId: number, data: CreateTournamentDto) =>
    axios.put<Tournament>(
      `${BASE_URL}/${encodeURIComponent(teamName)}/tournaments/${tournamentId}`,
      data,
    ),

  delete: (teamName: string, tournamentId: number) =>
    axios.delete(
      `${BASE_URL}/${encodeURIComponent(teamName)}/tournaments/${tournamentId}`,
    ),
};
