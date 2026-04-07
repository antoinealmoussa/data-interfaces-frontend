import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuth } from "../../hooks/useAuth";
import { AuthProvider } from "../../contexts/AuthContext";

describe("useAuth", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("devrait retourner le contexte d'authentification", () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        expect(result.current).toHaveProperty('isAuthenticated');
        expect(result.current).toHaveProperty('user');
        expect(result.current).toHaveProperty('applications');
        expect(result.current).toHaveProperty('token');
        expect(result.current).toHaveProperty('login');
        expect(result.current).toHaveProperty('logout');
    });

    it("devrait avoir login et logout comme fonctions", () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        expect(typeof result.current.login).toBe("function");
        expect(typeof result.current.logout).toBe("function");
    });

    it("devrait avoir les bons types pour les propriétés", () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        expect(typeof result.current.isAuthenticated).toBe("boolean");
        expect(result.current.user).toBeNull();
        expect(result.current.applications).toBeNull();
        expect(result.current.token).toBeNull();
    });
});
