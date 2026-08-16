import type { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import type { Role } from "../../types/authTypes";

type RoleGuardProps = {
  roles: Role[];
  children: ReactNode;
  fallback?: ReactNode;
};

export const RoleGuard = ({ roles, children, fallback = null }: RoleGuardProps) => {
  const { hasRole } = useAuth();
  return hasRole(...roles) ? children : fallback;
};
