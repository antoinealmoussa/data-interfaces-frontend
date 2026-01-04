import { LoginForm } from "../../components/authentication/LoginForm";
import { RegisterForm } from "../../components/authentication/RegisterForm";

export const authRoutes = [
    { path: "/login", element: <LoginForm /> },
    { path: "/register", element: <RegisterForm /> }
];
