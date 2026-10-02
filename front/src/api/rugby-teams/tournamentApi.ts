import apiClient, { teamPath } from "../client";
import { API_SEGMENTS } from "../endpoints";
import type { Tournament, CreateTournamentDto } from "../../types/rugby-teams/tournamentTypes";

export const tournamentApi = {
  getByTeam: (teamName: string, seasonId: number) =>
    apiClient
      .get<Tournament[]>(
        `${teamPath(teamName, API_SEGMENTS.tournaments)}?season_id=${seasonId}`,
      )
      .then((r) => r.data),

  create: (teamName: string, seasonId: number, data: CreateTournamentDto) =>
    apiClient
      .post<Tournament>(
        `${teamPath(teamName, API_SEGMENTS.tournaments)}?season_id=${seasonId}`,
        data,
      )
      .then((r) => r.data),

  update: (teamName: string, seasonId: number, tournamentId: number, data: CreateTournamentDto) =>
    apiClient
      .put<Tournament>(
        `${teamPath(teamName, API_SEGMENTS.tournaments, String(tournamentId))}?season_id=${seasonId}`,
        data,
      )
      .then((r) => r.data),

  delete: (teamName: string, seasonId: number, tournamentId: number) =>
    apiClient.delete(
      `${teamPath(teamName, API_SEGMENTS.tournaments, String(tournamentId))}?season_id=${seasonId}`,
    ),
};

export type TournamentApiType = typeof tournamentApi;
