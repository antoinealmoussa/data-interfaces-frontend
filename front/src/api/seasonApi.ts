import axios from "axios";
import API_URLS from "./config";
import type { Season } from "../types/seasonTypes";

const SEASON_URL = `${API_URLS.backend}/seasons`;

export const seasonApi = {
  getAll: () => axios.get<Season[]>(SEASON_URL),
  getById: (id: number) => axios.get<Season>(`${SEASON_URL}/${id}`),
};
