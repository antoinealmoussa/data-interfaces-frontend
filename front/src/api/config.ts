import axios from "axios";

const API_URLS = {
  backend: import.meta.env.VITE_BACKEND_API,
};

axios.defaults.withCredentials = true;

export default API_URLS;
