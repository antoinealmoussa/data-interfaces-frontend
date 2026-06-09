import apiClient from "./client";
import type { Player, CreatePlayerDto } from "../types/playerTypes";

const BASE_URL = "/teams";

export const playerApi = {
  getByTeam: (teamName: string, skip = 0, limit = 100) =>
    apiClient
      .get<
        Player[]
      >(`${BASE_URL}/${encodeURIComponent(teamName)}/players?skip=${skip}&limit=${limit}`)
      .then((r) => r.data),

  getById: (teamName: string, playerId: number) =>
    apiClient
      .get<Player>(
        `${BASE_URL}/${encodeURIComponent(teamName)}/players/${playerId}`,
      )
      .then((r) => r.data),

  create: (teamName: string, data: CreatePlayerDto) =>
    apiClient
      .post<Player>(`${BASE_URL}/${encodeURIComponent(teamName)}/players`, data)
      .then((r) => r.data),

  update: (teamName: string, playerId: number, data: CreatePlayerDto) =>
    apiClient
      .put<Player>(
        `${BASE_URL}/${encodeURIComponent(teamName)}/players/${playerId}`,
        data,
      )
      .then((r) => r.data),

  delete: (teamName: string, playerId: number) =>
    apiClient.delete(
      `${BASE_URL}/${encodeURIComponent(teamName)}/players/${playerId}`,
    ),
};

export type PlayerApiType = typeof playerApi;
