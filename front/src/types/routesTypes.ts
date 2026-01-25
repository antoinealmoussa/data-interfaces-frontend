import type { JSX } from "react";

export const AppNameMapper = {
    BIKE_EXPLORATION: "bike-exploration",
    RUGBY_TEAMS: "rugby-teams",
    RACE_PREPARATION: "race-preparation"
};

export type AppName = typeof AppNameMapper[keyof typeof AppNameMapper];

export interface RouteProps {
    path: string;
    element: JSX.Element;
}