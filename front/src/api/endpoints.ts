export const API_PATHS = {
  auth: {
    login: "/users/login",
    register: "/users/register",
    logout: "/users/logout",
    refresh: "/token/refresh",
    me: "/users/me",
  },
  search: {
    topic: "/search/topic",
  },
  applications: {
    base: "/applications",
  },
  applicationAccessRequests: {
    base: "/application-access-requests",
  },
  rugbyTeams: {
    teams: "/rugby-teams/teams",
  },
  bikeExploration: {
    base: "/bike-exploration",
  },
} as const;

export const API_SEGMENTS = {
  players: "players",
  tournaments: "tournaments",
  training: "training",
  algorithms: "algorithms",
  distribute: "distribute",
  cols: "cols",
  conquered: "conquered",
} as const;

export const AUTH_EVENTS = {
  unauthorized: "auth:unauthorized",
} as const;
