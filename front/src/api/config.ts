import { type AxiosRequestHeaders } from "axios";

const API_URLS = {
  backend: import.meta.env.VITE_BACKEND_API,
};

export const getAuthHeaders = (): AxiosRequestHeaders => {
    const token = localStorage.getItem("token");
    if (token) {
        return {
            Authorization: `Bearer ${token}`,
        } as AxiosRequestHeaders;
    }
    return {} as AxiosRequestHeaders;
};

export default API_URLS;

