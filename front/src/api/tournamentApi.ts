import apiClient, { teamPath } from "./client";
import type { Tournament, CreateTournamentDto } from "../types/tournamentTypes";

export const tournamentApi = {
  getByTeam: (teamName: string) =>
    apiClient
      .get<
        Tournament[]
      >(teamPath(teamName, "tournaments"))
      .then((r) => r.data),

  create: (teamName: string, data: CreateTournamentDto) =>
    apiClient
      .post<Tournament>(
        teamPath(teamName, "tournaments"),
        data,
      )
      .then((r) => r.data),

  update: (teamName: string, tournamentId: number, data: CreateTournamentDto) =>
    apiClient
      .put<Tournament>(
        teamPath(teamName, "tournaments", String(tournamentId)),
        data,
      )
      .then((r) => r.data),

  delete: (teamName: string, tournamentId: number) =>
    apiClient.delete(
      teamPath(teamName, "tournaments", String(tournamentId)),
    ),
};

export type TournamentApiType = typeof tournamentApi;
