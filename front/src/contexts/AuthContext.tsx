import { useState, createContext, type ReactNode, useEffect } from 'react';
import { type User, type AuthContextType } from "../types/authTypes";

const defaultAuthContext: AuthContextType = {
    isAuthenticated: false,
    user: null,
    login: () => { },
    logout: () => { }
}

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const currentUser = localStorage.getItem("user");
        if (currentUser) {
            setUser(JSON.parse(currentUser));
            setIsAuthenticated(true);
        }
    }, []);

    const login = (data: User) => {
        setIsAuthenticated(true);
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
    }

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("user");
    }

    const ContextValue: AuthContextType = {
        isAuthenticated,
        user,
        login,
        logout
    }

    return (
        <AuthContext.Provider value={ContextValue}>
            {children}
        </AuthContext.Provider>
    );
}