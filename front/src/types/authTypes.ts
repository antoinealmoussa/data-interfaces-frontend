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

export type User = {
  email: string;
  first_name: string;
  surname: string;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
};
