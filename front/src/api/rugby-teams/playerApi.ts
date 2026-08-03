import apiClient, { teamPath } from "../client";
import { API_SEGMENTS } from "../endpoints";
import type { Player, CreatePlayerDto } from "../../types/rugby-teams/playerTypes";

export const playerApi = {
  getByTeam: (teamName: string, skip = 0, limit = 100) =>
    apiClient
      .get<Player[]>(
        `${teamPath(teamName, API_SEGMENTS.players)}?skip=${skip}&limit=${limit}`,
      )
      .then((r) => r.data),
  create: (teamName: string, data: CreatePlayerDto) =>
    apiClient
      .post<Player>(teamPath(teamName, API_SEGMENTS.players), data)
      .then((r) => r.data),
  update: (teamName: string, playerId: number, data: CreatePlayerDto) =>
    apiClient
      .put<Player>(teamPath(teamName, API_SEGMENTS.players, String(playerId)), data)
      .then((r) => r.data),
  delete: (teamName: string, playerId: number) =>
    apiClient.delete(teamPath(teamName, API_SEGMENTS.players, String(playerId))),
};

export type PlayerApiType = typeof playerApi;
