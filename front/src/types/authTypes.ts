export type LoginFormProps = {
  email: string;
  password: string;
};

export type RegisterFormProps = {
  email: string;
  password: string;
  first_name: string;
  surname: string;
};

export type Role = "admin" | "normal_user";

export type User = {
  id: number;
  email: string;
  first_name: string;
  surname: string;
  role: Role;
};

export type Application = {
  name: string;
  pretty_name: string;
};

export type MeResponse = {
  user: User;
  applications: Application[];
};

export type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  applications: Application[] | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
  isAdmin: boolean;
};
