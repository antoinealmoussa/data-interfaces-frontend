import { LoginForm } from "../../components/authentication/LoginForm";
import { RegisterForm } from "../../components/authentication/RegisterForm";
import { LogoutPage } from "./LogoutPage";

export const authRoutes = [
    { path: "/login", element: <LoginForm /> },
    { path: "/register", element: <RegisterForm /> },
    { path: "/logout", element: <LogoutPage />}
];
