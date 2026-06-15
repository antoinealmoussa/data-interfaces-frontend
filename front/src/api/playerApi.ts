import apiClient, { teamPath } from "./client";
import type { Player, CreatePlayerDto } from "../types/playerTypes";

export const playerApi = {
  getByTeam: (teamName: string, skip = 0, limit = 100) =>
    apiClient.get<Player[]>(`${teamPath(teamName, "players")}?skip=${skip}&limit=${limit}`).then((r) => r.data),
  getById: (teamName: string, playerId: number) =>
    apiClient.get<Player>(teamPath(teamName, "players", String(playerId))).then((r) => r.data),
  create: (teamName: string, data: CreatePlayerDto) =>
    apiClient.post<Player>(teamPath(teamName, "players"), data).then((r) => r.data),
  update: (teamName: string, playerId: number, data: CreatePlayerDto) =>
    apiClient.put<Player>(teamPath(teamName, "players", String(playerId)), data).then((r) => r.data),
  delete: (teamName: string, playerId: number) =>
    apiClient.delete(teamPath(teamName, "players", String(playerId))),
};

export type PlayerApiType = typeof playerApi;
