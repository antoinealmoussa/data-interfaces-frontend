import axios from "axios";
import API_URLS from "../api/config";
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

const BASE_URL = `${API_URLS.backend}/teams`;

export const trainingApi = {
  getAlgorithms: (teamName: string) =>
    axios.get<AlgorithmInfo[]>(
      `${BASE_URL}/${encodeURIComponent(teamName)}/training/algorithms`,
    ),

  distribute: (teamName: string, data: DistributeRequest) =>
    axios.post<DistributeResponse>(
      `${BASE_URL}/${encodeURIComponent(teamName)}/training/distribute`,
      data,
    ),
};
