import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContextDefinition";

export const useAuth = () => {
  return useContext(AuthContext);
};
