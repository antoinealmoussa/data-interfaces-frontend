import API_URLS from "../config";
import apiClient from "../client";
import type { Col } from "../../types/bike-exploration/colTypes";

const BASE = "/bike-exploration";

export interface UploadProgress {
  type: "start";
  total: number;
}

export interface UploadProgressUpdate {
  type: "progress";
  current: number;
  total: number;
  name: string;
}

export interface UploadComplete {
  type: "complete";
  created: number;
  skipped: number;
  failed: number;
  cols: Col[];
}

export interface UploadCancelled {
  type: "cancelled";
  created: number;
  skipped: number;
  failed: number;
}

export interface UploadError {
  type: "error";
  message: string;
}

export type UploadEvent =
  | UploadProgress
  | UploadProgressUpdate
  | UploadComplete
  | UploadCancelled
  | UploadError;

export const bikeApi = {
  cancelTask: (taskId: string) =>
    apiClient.delete(`${BASE}/activities/upload/${taskId}`).then((r) => r.data),
  uploadFile: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient
      .post<{ task_id: string }>(`${BASE}/activities/upload`, form)
      .then((r) => r.data);
  },

  streamProgress: async (
    taskId: string,
    onEvent: (event: UploadEvent) => void,
  ): Promise<void> => {
    const res = await fetch(
      `${API_URLS.backend}${BASE}/activities/upload/${taskId}/progress`,
      { credentials: "include" },
    );
    if (!res.ok || !res.body) {
      throw new Error(`Progress stream failed: ${res.status}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6);
        if (!payload) continue;
        try {
          onEvent(JSON.parse(payload) as UploadEvent);
        } catch {
          // ignore malformed events
        }
      }
    }
  },

  getCols: () =>
    apiClient.get<Col[]>(`${BASE}/cols`).then((r) => r.data),

  getConqueredCols: () =>
    apiClient
      .get<Col[]>(`${BASE}/cols/conquered`)
      .then((r) => r.data),

  resetActivities: () =>
    apiClient.delete(`${BASE}/activities`).then((r) => r.data),
};
