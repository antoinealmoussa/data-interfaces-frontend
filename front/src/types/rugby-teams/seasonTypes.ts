export interface Season {
  id: number;
  name: string; // Format AAAA-AAAA
}

export interface CreateSeasonDto {
  name: string;
  player_ids: number[];
}
