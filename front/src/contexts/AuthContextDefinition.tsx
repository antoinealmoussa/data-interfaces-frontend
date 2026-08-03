import { createContext } from "react";
import type { AuthContextType } from "../types/authTypes";

const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  applications: null,
  login: async () => {},
  logout: async () => {},
  hasRole: () => false,
  isAdmin: false,
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);
