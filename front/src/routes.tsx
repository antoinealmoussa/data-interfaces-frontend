import { Home } from "./pages/Home";
import { NameDashboard } from "./pages/NameDashboard";

export const routes = [
    { path: "/", element: <Home /> },
    { path: "/name-dashboard", element: <NameDashboard /> },
];
