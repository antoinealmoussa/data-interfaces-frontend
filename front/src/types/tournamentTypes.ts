export interface Tournament {
  id: number;
  name: string;
  category_name: string;
  player_names: string[];
}

export interface CreateTournamentDto {
  name: string;
  category_name: string;
  player_names: string[];
}


