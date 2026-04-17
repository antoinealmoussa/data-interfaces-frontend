import { useState, createContext, type ReactNode, useEffect } from "react";
import type {
  User,
  Application,
  AuthContextType,
  MeResponse,
} from "../types/authTypes";
import axios from "axios";
import API_URLS from "../api/config";

const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  applications: null,
  login: async () => {},
  logout: async () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(null);

  useEffect(() => {
    axios
      .get<MeResponse>(`${API_URLS.backend}/users/me`)
      .then((response) => {
        setUser(response.data.user);
        setApplications(response.data.applications);
        setIsAuthenticated(true);
      })
      .catch(() => {
        setIsAuthenticated(false);
        setUser(null);
        setApplications(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async () => {
    const response = await axios.get<MeResponse>(
      `${API_URLS.backend}/users/me`
    );
    setUser(response.data.user);
    setApplications(response.data.applications);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await axios.post(`${API_URLS.backend}/users/logout`);
    setIsAuthenticated(false);
    setApplications(null);
    setUser(null);
  };

  const ContextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    applications,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={ContextValue}>{children}</AuthContext.Provider>
  );
};
