import { useAuth } from "../../hooks/useAuth";
import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";


export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated, isAuthLoading } = useAuth();

    console.log(isAuthLoading, isAuthenticated)
    if (isAuthLoading) return null;

    return isAuthenticated ? children : <Navigate to="/login" replace />
}