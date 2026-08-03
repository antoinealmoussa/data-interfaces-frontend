export interface Col {
  id: number;
  osm_id: number | null;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number | null;
  country: string | null;
  activity_count: number;
  total_crossings: number;
}
