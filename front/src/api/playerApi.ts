import axios from "axios";
import API_URLS from "./config";
import type { Player, CreatePlayerDto } from "../types/playerTypes";

const BASE_URL = `${API_URLS.backend}/teams`;

export const playerApi = {
  getByTeam: (teamName: string, skip = 0, limit = 100) =>
    axios.get<Player[]>(`${BASE_URL}/${encodeURIComponent(teamName)}/players?skip=${skip}&limit=${limit}`),

  getById: (teamName: string, playerId: number) =>
    axios.get<Player>(`${BASE_URL}/${encodeURIComponent(teamName)}/players/${playerId}`),

  create: (teamName: string, data: CreatePlayerDto) =>
    axios.post<Player>(`${BASE_URL}/${encodeURIComponent(teamName)}/players`, data),

  update: (teamName: string, playerId: number, data: CreatePlayerDto) =>
    axios.put<Player>(`${BASE_URL}/${encodeURIComponent(teamName)}/players/${playerId}`, data),

  delete: (teamName: string, playerId: number) =>
    axios.delete(`${BASE_URL}/${encodeURIComponent(teamName)}/players/${playerId}`),
};
