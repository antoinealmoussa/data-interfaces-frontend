import { useState, createContext, type ReactNode, useEffect } from "react";
import type {
  User,
  Application,
  AuthContextType,
  MeResponse,
} from "../types/authTypes";
import axios from "axios";
import API_URLS, { getAuthHeaders } from "../api/config";

const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  isLoading: true,
  token: null,
  user: null,
  applications: null,
  login: () => {},
  logout: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) {
      setIsLoading(false);
      return;
    }

    axios
      .get<MeResponse>(`${API_URLS.backend}/users/me`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      })
      .then((response) => {
        setToken(currentToken);
        setUser(response.data.user);
        setApplications(response.data.applications);
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("applications");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = async (token: string) => {
    setToken(token);
    localStorage.setItem("token", token);

    const response = await axios.get<MeResponse>(
      `${API_URLS.backend}/users/me`,
      {
        headers: getAuthHeaders(),
      },
    );
    setUser(response.data.user);
    setApplications(response.data.applications);
    localStorage.setItem("user", JSON.stringify(response.data.user));
    localStorage.setItem(
      "applications",
      JSON.stringify(response.data.applications),
    );

    setIsAuthenticated(true);
  };

  const logout = async () => {
    await axios.post(
      `${API_URLS.backend}/users/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    setIsAuthenticated(false);
    setApplications(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("applications");
  };

  const ContextValue: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    applications,
    token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={ContextValue}>{children}</AuthContext.Provider>
  );
};
