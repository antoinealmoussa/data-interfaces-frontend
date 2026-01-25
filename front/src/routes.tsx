import { BikeExploration } from "./pages/bike-exploration/BikeExploration";
import { Home } from "./pages/Home";
import { UserProfile } from "./pages/management/UserProfile";
import { RacePreparation } from "./pages/race-preparation/RacePreparation";
import { RugbyTeams } from "./pages/rugby-teams/RugbyTeams";
import { type AppName, type RouteProps } from "./types/routesTypes";
import { AppNameMapper } from "./types/routesTypes";


export const PRIVATE_STANDARD_ROUTES: Record<string, RouteProps> = {
    HOME: { path: "/", element: <Home /> },
    PROFILE: { path: "/profile", element: <UserProfile /> }
};

export const DYNAMIC_APP_ROUTES: Record<AppName, RouteProps> = {
    [AppNameMapper.BIKE_EXPLORATION]: { path: "/bike-exploration", element: <BikeExploration /> },
    [AppNameMapper.RUGBY_TEAMS]: { path: "/rugby-teams", element: <RugbyTeams /> },
    [AppNameMapper.RACE_PREPARATION]: { path: "/race-preparation", element: <RacePreparation /> },
}