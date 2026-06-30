import type { Season } from "./seasonTypes";

export const TEAM_CATEGORIES = [
  "Mixte",
  "+35",
  "+50",
  "Open féminin",
  "Open masculin",
] as const;

export type TeamCategory = (typeof TEAM_CATEGORIES)[number];

export interface Team {
  id: number;
  name: string;
  categories: TeamCategory[];
  user_id: number;
  seasons: Season[]; // Saisons associées
}

export interface CreateTeamDto {
  name: string;
  categories: TeamCategory[];
  user_id: number;
  season_name: string; // Nom de la saison (ex: "2025-2026")
}
