import apiClient from "./client";
import type { Player } from "../types/playerTypes";

export interface AlgorithmInfo {
  id: string;
  label: string;
}

export interface DistributeRequest {
  player_ids: number[];
  team_count: number;
  algorithm: string;
}

export interface TrainingTeam {
  id: number;
  name: string;
  players: Player[];
}

export interface DistributeResponse {
  teams: TrainingTeam[];
}

const BASE_URL = "/teams";

export const trainingApi = {
  getAlgorithms: (teamName: string) =>
    apiClient
      .get<AlgorithmInfo[]>(
        `${BASE_URL}/${encodeURIComponent(teamName)}/training/algorithms`,
      )
      .then((r) => r.data),

  distribute: (teamName: string, data: DistributeRequest) =>
    apiClient
      .post<DistributeResponse>(
        `${BASE_URL}/${encodeURIComponent(teamName)}/training/distribute`,
        data,
      )
      .then((r) => r.data),
};

export type TrainingApiType = typeof trainingApi;
