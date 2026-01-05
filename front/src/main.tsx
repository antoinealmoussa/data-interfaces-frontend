import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppThemeProvider } from "./theme";
import App from "./App";
import { routes } from "./routes"
import { authRoutes } from "./pages/authentication/routes";
import { PublicLayout } from "./pages/authentication/PublicLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/authentication/ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Routes publiques */}
            <Route element={<PublicLayout />}>
              {authRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Route>
            {/* Routes privées protégées */}
            <Route element={<ProtectedRoute><App /></ProtectedRoute>}>
              {routes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AppThemeProvider>
  </React.StrictMode>
);
