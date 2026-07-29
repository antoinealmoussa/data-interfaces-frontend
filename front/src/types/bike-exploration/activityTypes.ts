import type { Col } from "./colTypes";

export interface Activity {
  id: number;
  stravaActivityId: number;
  name: string;
  startDate: string;
  cols: Col[];
}
