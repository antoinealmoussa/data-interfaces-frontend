import apiClient, { teamPath } from "../client";
import { API_SEGMENTS } from "../endpoints";
import type { Player } from "../../types/rugby-teams/playerTypes";

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

export const trainingApi = {
  getAlgorithms: (teamName: string) =>
    apiClient
      .get<AlgorithmInfo[]>(
        teamPath(teamName, API_SEGMENTS.training, API_SEGMENTS.algorithms),
      )
      .then((r) => r.data),

  distribute: (teamName: string, data: DistributeRequest) =>
    apiClient
      .post<DistributeResponse>(
        teamPath(teamName, API_SEGMENTS.training, API_SEGMENTS.distribute),
        data,
      )
      .then((r) => r.data),
};

export type TrainingApiType = typeof trainingApi;
