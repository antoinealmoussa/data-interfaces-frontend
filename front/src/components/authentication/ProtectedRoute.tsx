import { useAuth } from "../../hooks/useAuth";
import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";


export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" replace />
}