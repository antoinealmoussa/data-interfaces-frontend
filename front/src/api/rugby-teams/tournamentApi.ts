import apiClient, { teamPath } from "../client";
import { API_SEGMENTS } from "../endpoints";
import type { Tournament, CreateTournamentDto } from "../../types/rugby-teams/tournamentTypes";

export const tournamentApi = {
  getByTeam: (teamName: string) =>
    apiClient
      .get<Tournament[]>(teamPath(teamName, API_SEGMENTS.tournaments))
      .then((r) => r.data),

  create: (teamName: string, data: CreateTournamentDto) =>
    apiClient
      .post<Tournament>(teamPath(teamName, API_SEGMENTS.tournaments), data)
      .then((r) => r.data),

  update: (teamName: string, tournamentId: number, data: CreateTournamentDto) =>
    apiClient
      .put<Tournament>(
        teamPath(teamName, API_SEGMENTS.tournaments, String(tournamentId)),
        data,
      )
      .then((r) => r.data),

  delete: (teamName: string, tournamentId: number) =>
    apiClient.delete(
      teamPath(teamName, API_SEGMENTS.tournaments, String(tournamentId)),
    ),
};

export type TournamentApiType = typeof tournamentApi;
