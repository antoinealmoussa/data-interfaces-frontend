import axios from "axios";

const API_URLS = {
  backend: import.meta.env.VITE_BACKEND_API || "/api/v1",
};

axios.defaults.withCredentials = true;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const authEndpoints = ["/login", "/register", "/logout"];
    const isAuthEndpoint = authEndpoints.some((e) =>
      error.config?.url?.includes(e)
    );
    if (error.response?.status === 401 && !isAuthEndpoint) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    return Promise.reject(error);
  }
);

export default API_URLS;
