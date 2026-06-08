import React from "react";
import { Route, Routes } from "react-router-dom";
import App from "../../App";
import { PRIVATE_STANDARD_ROUTES, DYNAMIC_APP_ROUTES } from "../../routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicLayout } from "../../pages/authentication/PublicLayout";
import { authRoutes } from "../../pages/authentication/routes";
import { useAuth } from "../../hooks/useAuth";
import type { AppName, RouteProps } from "../../types/routesTypes";

const renderRoute = (route: RouteProps): React.ReactNode => {
  if (route.children) {
    return (
      <Route key={route.path} path={route.path} element={route.element}>
        {route.children.map(renderRoute)}
      </Route>
    );
  }
  return <Route key={route.path} path={route.path} element={route.element} />;
};

export const AppRoutes: React.FC = () => {
  const { applications } = useAuth();

  return (
    <Routes>
      {/* Routes publiques */}
      <Route element={<PublicLayout />}>
        {authRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>
      <Route
        element={
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        }
      >
        {/* Routes privées standards */}
        {Object.values(PRIVATE_STANDARD_ROUTES).map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Routes privées dynamiques */}
        {applications &&
          applications.map((app) => {
            const userAppConfig = DYNAMIC_APP_ROUTES[app.name as AppName];
            return userAppConfig ? renderRoute(userAppConfig) : null;
          })}
      </Route>
    </Routes>
  );
};
