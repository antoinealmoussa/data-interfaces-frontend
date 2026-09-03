export type SectionType = "climb" | "flat" | "descent" | "aid_station";

export interface TrackPoint {
  lat: number;
  lon: number;
  elevation: number;
  distance: number;
}

export interface Section {
  id: number;
  race_id: number;
  order_index: number;
  name: string | null;
  section_type: SectionType;
  start_distance: number;
  end_distance: number;
  distance: number;
  elevation_gain: number;
  elevation_loss: number;
  average_gradient: number;
  start_elevation: number;
  end_elevation: number;
  pace: number | null;
  actual_pace: number | null;
}

export interface ComputedSection {
  id?: number;
  race_id?: number;
  order_index?: number;
  name?: string | null;
  section_type: SectionType;
  start_distance: number;
  end_distance: number;
  distance: number;
  elevation_gain: number;
  elevation_loss: number;
  average_gradient: number;
  start_elevation: number;
  end_elevation: number;
  pace?: number | null;
  actual_pace?: number | null;
}

export interface Race {
  id: number;
  name: string;
  file_name: string;
  user_id: number;
  gpx_file_path: string;
  total_distance: number;
  total_elevation_gain: number;
  total_elevation_loss: number;
  sections: Section[];
  created_at: string;
  updated_at: string;
}

export interface TrackPointsResponse {
  track_points: TrackPoint[];
}

export interface UpdateSectionsRequest {
  sections: {
    section_id: number;
    name?: string | null;
    pace?: number | null;
    actual_pace?: number | null;
  }[];
}

export interface Marker {
  key: string;
  distance: number;
  type: "boundary" | "aid_station";
  waitTime: number | null;
}

export interface CalculateSectionsRequest {
  markers: {
    distance: number;
    marker_type: "boundary" | "aid_station";
    wait_time: number | null;
  }[];
}