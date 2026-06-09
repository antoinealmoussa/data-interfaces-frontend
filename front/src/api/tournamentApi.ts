import apiClient from "./client";
import type { Tournament, CreateTournamentDto } from "../types/tournamentTypes";

const BASE_URL = "/teams";

export const tournamentApi = {
  getByTeam: (teamName: string) =>
    apiClient
      .get<Tournament[]>(
        `${BASE_URL}/${encodeURIComponent(teamName)}/tournaments`,
      )
      .then((r) => r.data),

  create: (teamName: string, data: CreateTournamentDto) =>
    apiClient
      .post<Tournament>(
        `${BASE_URL}/${encodeURIComponent(teamName)}/tournaments`,
        data,
      )
      .then((r) => r.data),

  update: (teamName: string, tournamentId: number, data: CreateTournamentDto) =>
    apiClient
      .put<Tournament>(
        `${BASE_URL}/${encodeURIComponent(teamName)}/tournaments/${tournamentId}`,
        data,
      )
      .then((r) => r.data),

  delete: (teamName: string, tournamentId: number) =>
    apiClient.delete(
      `${BASE_URL}/${encodeURIComponent(teamName)}/tournaments/${tournamentId}`,
    ),
};

export type TournamentApiType = typeof tournamentApi;
