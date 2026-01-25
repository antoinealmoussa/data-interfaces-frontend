import React from "react";
import { Route, Routes } from "react-router-dom";
import App from "../../App";
import { PRIVATE_STANDARD_ROUTES, DYNAMIC_APP_ROUTES } from "../../routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicLayout } from "../../pages/authentication/PublicLayout";
import { authRoutes } from "../../pages/authentication/routes";
import { useUserApplications } from "../../hooks/useUserApplications";
import { useAuth } from "../../hooks/useAuth";
import type { AppName } from "../../types/routesTypes";


export const AppRoutes: React.FC = () => {
    const { user } = useAuth();
    const { data: userApplicationData } = useUserApplications(user)

    return (
        <Routes>
            {/* Routes publiques */}
            <Route element={<PublicLayout />}>
                {authRoutes.map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                ))}
            </Route>
            <Route element={<ProtectedRoute><App /></ProtectedRoute>}>
                {/* Routes privées standards */}
                {Object.values(PRIVATE_STANDARD_ROUTES).map((route) => (
                    <Route key={route.path} path={route.path} element={route.element} />
                ))}

                {/* Routes privées dynamiques */}
                {userApplicationData?.map((userApp) => {
                    const userAppConfig = DYNAMIC_APP_ROUTES[userApp.name as AppName];
                    return userAppConfig ? <Route
                        key={userAppConfig.path}
                        path={userAppConfig.path}
                        element={userAppConfig.element}
                    /> : null
                })
                }
            </Route>
        </Routes>

    )
}