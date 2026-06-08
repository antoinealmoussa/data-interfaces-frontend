import { useAuth } from "../../hooks/useAuth";
import React, { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "../ui/LoadingSpinner";

export const ProtectedRoute: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};
