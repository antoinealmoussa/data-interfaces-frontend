import axios from "axios";
import API_URLS from "../api/config";
import type { Tournament, CreateTournamentDto, UpdateTournamentDto } from "../types/tournamentTypes";

const BASE_URL = `${API_URLS.backend}/teams`;

export const tournamentApi = {
  getByTeam: (teamName: string) =>
    axios.get<Tournament[]>(
      `${BASE_URL}/${encodeURIComponent(teamName)}/tournaments`,
    ),

  getById: (teamName: string, tournamentId: number) =>
    axios.get<Tournament>(
      `${BASE_URL}/${encodeURIComponent(teamName)}/tournaments/${tournamentId}`,
    ),

  create: (teamName: string, data: CreateTournamentDto) =>
    axios.post<Tournament>(
      `${BASE_URL}/${encodeURIComponent(teamName)}/tournaments`,
      data,
    ),

  update: (teamName: string, tournamentId: number, data: UpdateTournamentDto) =>
    axios.put<Tournament>(
      `${BASE_URL}/${encodeURIComponent(teamName)}/tournaments/${tournamentId}`,
      data,
    ),

  delete: (teamName: string, tournamentId: number) =>
    axios.delete(
      `${BASE_URL}/${encodeURIComponent(teamName)}/tournaments/${tournamentId}`,
    ),
};
