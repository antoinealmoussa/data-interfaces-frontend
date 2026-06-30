import axios, { type AxiosResponse } from "axios";
import API_URLS from "./config";

const apiClient = axios.create({
  baseURL: API_URLS.backend,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: AxiosResponse | PromiseLike<AxiosResponse>) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(undefined as unknown as AxiosResponse);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authEndpoints = ["/login", "/register", "/logout", "/token/refresh"];
    const isAuthEndpoint = authEndpoints.some((e) =>
      originalRequest?.url?.includes(e),
    );

    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await apiClient.post("/token/refresh");
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;

export const teamPath = (teamName: string, ...segments: string[]) =>
  `/rugby-teams/teams/${encodeURIComponent(teamName)}/${segments.join("/")}`;