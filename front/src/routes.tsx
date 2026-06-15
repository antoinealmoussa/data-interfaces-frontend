import { lazy } from "react";

const BikeExploration = lazy(
  () => import("./pages/bike-exploration/BikeExploration"),
);
const Home = lazy(() => import("./pages/Home"));
const UserProfile = lazy(() => import("./pages/management/UserProfile"));
const RacePreparation = lazy(
  () => import("./pages/race-preparation/RacePreparation"),
);
const RugbyTeams = lazy(() => import("./pages/rugby-teams/RugbyTeams"));
const TeamCreation = lazy(() => import("./pages/rugby-teams/TeamCreation"));
const TeamManagement = lazy(() => import("./pages/rugby-teams/TeamManagement"));
const TournamentManagement = lazy(
  () => import("./pages/rugby-teams/TournamentManagement"),
);
const Training = lazy(() => import("./pages/rugby-teams/Training"));

import { type AppName, type RouteProps } from "./types/routesTypes";
import { AppNameMapper } from "./types/routesTypes";

export const PRIVATE_STANDARD_ROUTES: Record<string, RouteProps> = {
  HOME: { path: "/", element: <Home /> },
  PROFILE: { path: "/profile", element: <UserProfile /> },
};

export const DYNAMIC_APP_ROUTES: Record<AppName, RouteProps> = {
  [AppNameMapper.BIKE_EXPLORATION]: {
    path: "/bike-exploration",
    element: <BikeExploration />,
  },
  [AppNameMapper.RUGBY_TEAMS]: {
    path: "/rugby-teams",
    element: <RugbyTeams />,
    children: [
      { path: "team-creation", element: <TeamCreation /> },
      {
        path: ":teamName/:seasonName/team-management",
        element: <TeamManagement />,
      },
      {
        path: ":teamName/:seasonName/tournament",
        element: <TournamentManagement />,
      },
      { path: ":teamName/:seasonName/training", element: <Training /> },
    ],
  },
  [AppNameMapper.RACE_PREPARATION]: {
    path: "/race-preparation",
    element: <RacePreparation />,
  },
};
