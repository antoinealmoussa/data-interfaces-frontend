import { useEffect } from "react";
import { useLogout } from "../../hooks/useLogout"

export const LogoutPage: React.FC = () => {
    const logout = useLogout();

    useEffect(() => {
       logout()
    }, [logout]);

    return null;
}