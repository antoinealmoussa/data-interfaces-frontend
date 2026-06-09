export interface Player {
  id: number;
  name: string;
  level: number;
  sex: 'H' | 'F';
  position: 'Ailier' | 'Meneur';
  team_name: string;
  category_names: string[];
}

export interface CreatePlayerDto {
  name: string;
  level: number;
  sex: 'H' | 'F';
  position: 'Ailier' | 'Meneur';
  category_names: string[];
}


