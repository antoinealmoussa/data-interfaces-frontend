import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "../../hooks/useAuth";
import { AuthProvider } from "../../contexts/AuthContext";
import axios from "axios";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

vi.mock("../../api/config", () => ({
    default: {
        backend: "http://localhost:8000/api/v1",
    },
}));

describe("useAuth", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedAxios.get.mockRejectedValueOnce(new Error("No cookie"));
    });

    it("devrait retourner le contexte d'authentification", async () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current).toHaveProperty('isAuthenticated');
        expect(result.current).toHaveProperty('user');
        expect(result.current).toHaveProperty('applications');
        expect(result.current).toHaveProperty('login');
        expect(result.current).toHaveProperty('logout');
    });

    it("devrait avoir login et logout comme fonctions async", async () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(typeof result.current.login).toBe("function");
        expect(typeof result.current.logout).toBe("function");
    });

    it("devrait avoir les bons types pour les propriétés", async () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: AuthProvider,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(typeof result.current.isAuthenticated).toBe("boolean");
        expect(result.current.user).toBeNull();
        expect(result.current.applications).toBeNull();
    });
});
