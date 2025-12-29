import { LoginForm } from "../../components/authentication/LoginForm";
import { SignInForm } from "../../components/authentication/SignInForm";

export const authRoutes = [
    { path: "/login", element: <LoginForm /> },
    { path: "/sign-in", element: <SignInForm /> }
];
