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
  id: number;
  email: string;
  first_name: string;
  surname: string;
};

export type Application = {
  name: string;
  pretty_name: string;
}

export type MeResponse = {
  user: User;
  applications: Application[];
}

export type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  applications: Application[] | null;
  token: string | null;
  login: ( token: string ) => void;
  logout: () => void;
};

