import { renderHook, act } from "@testing-library/react";
import { AuthProvider } from "../../contexts/AuthContext";
import { describe, it, expect } from "vitest";
import { useAuth } from "../../hooks/useAuth";

describe("AuthContext", () => {
    it("devrait s'initialiser avec isAuthenticated à false", () => {
        const { result } = renderHook(() => useAuth(),
            {
                wrapper: AuthProvider,
            });
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(localStorage.user).toBeUndefined();
    });

    it("devrait mettre à jour l'état après un login", () => {
        const { result } = renderHook(() => useAuth(),
            {
                wrapper: AuthProvider,
            });
        act(() => {
            result.current.login({ email: "test@mail.com", first_name: "Test", surname: "test" });
        });
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user?.email).toBe("test@mail.com");
        expect(result.current.user?.first_name).toBe("Test");
        expect(result.current.user?.surname).toBe("test");
        expect(localStorage.user).toBe(JSON.stringify({ email: "test@mail.com", first_name: "Test", surname: "test" }));
    })

    it("devrait réinitialiser l'état après un login puis un logout", () => {
        const { result } = renderHook(() => useAuth(),
            {
                wrapper: AuthProvider,
            });
        act(() => {
            result.current.login({ email: "test@mail.com", first_name: "Test", surname: "test" });
            result.current.logout();
        });
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
        expect(localStorage.user).toBeUndefined();
    })
})