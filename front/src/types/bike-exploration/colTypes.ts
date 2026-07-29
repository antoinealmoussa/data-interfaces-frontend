export interface Col {
  id: number;
  osmId: number | null;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number | null;
  country: string | null;
}
