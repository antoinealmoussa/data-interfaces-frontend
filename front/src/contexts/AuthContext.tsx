import { useState, type ReactNode, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type {
  User,
  Application,
  MeResponse,
  AuthContextType,
  Role,
} from "../types/authTypes";
import apiClient from "../api/client";
import { AUTH_EVENTS, API_PATHS } from "../api/endpoints";
import { AuthContext } from "./AuthContextDefinition";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const navigate = useNavigate();

  const unauthorize = () => {
    setIsAuthenticated(false);
    setUser(null);
    setApplications(null);
  };

  useEffect(() => {
    apiClient
      .get<MeResponse>(API_PATHS.auth.me)
      .then((response) => {
        setUser(response.data.user);
        setApplications(response.data.applications);
        setIsAuthenticated(true);
      })
      .catch(() => {
        unauthorize();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    window.addEventListener(AUTH_EVENTS.unauthorized, unauthorize);
    return () => window.removeEventListener(AUTH_EVENTS.unauthorized, unauthorize);
  }, []);

  const login = async () => {
    const response = await apiClient.get<MeResponse>(API_PATHS.auth.me);
    setUser(response.data.user);
    setApplications(response.data.applications);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await apiClient.post(API_PATHS.auth.logout);
    setIsAuthenticated(false);
    setApplications(null);
    setUser(null);
  };

  const hasRole = useCallback(
    (...roles: Role[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  const ContextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    applications,
    login,
    logout,
    hasRole,
    isAdmin: hasRole("admin"),
  };

  return (
    <AuthContext.Provider value={ContextValue}>{children}</AuthContext.Provider>
  );
};
