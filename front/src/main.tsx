import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppThemeProvider } from "./theme";
import App from "./App";
import { routes } from "./routes"
import { authRoutes } from "./pages/authentication/routes";
import { PublicLayout } from "./pages/authentication/PublicLayout";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes publiques */}
          <Route element={<PublicLayout />}>
            {authRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Route>
          {/* Routes privées protégées */}
          <Route element={<App />}>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Route>
        </Routes>
      </BrowserRouter>
    </AppThemeProvider>
  </React.StrictMode>
);
