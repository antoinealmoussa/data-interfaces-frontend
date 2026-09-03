import apiClient from "../client";
import { API_PATHS } from "../endpoints";
import type {
  Race,
  TrackPointsResponse,
  UpdateSectionsRequest,
  CalculateSectionsRequest,
} from "../../types/race-preparation/raceTypes";

const BASE = API_PATHS.racePreparation.base;

export const raceApi = {
  uploadGpx: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post<Race>(`${BASE}/races`, form).then((r) => r.data);
  },

  listRaces: () =>
    apiClient.get<Race[]>(`${BASE}/races`).then((r) => r.data),

  getRace: (id: number) =>
    apiClient.get<Race>(`${BASE}/races/${id}`).then((r) => r.data),

  getTrackPoints: (id: number) =>
    apiClient
      .get<TrackPointsResponse>(`${BASE}/races/${id}/track-points`)
      .then((r) => r.data),

  calculateSections: (id: number, request: CalculateSectionsRequest) =>
    apiClient
      .post<Race>(`${BASE}/races/${id}/sections/calculate`, request)
      .then((r) => r.data),

  updateSections: (id: number, request: UpdateSectionsRequest) =>
    apiClient.put(`${BASE}/races/${id}/sections`, request).then((r) => r.data),

  deleteRace: (id: number) =>
    apiClient.delete(`${BASE}/races/${id}`).then((r) => r.data),
};