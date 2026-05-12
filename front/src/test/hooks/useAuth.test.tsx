import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AuthProvider } from "../../contexts/AuthContext";

vi.mock("axios", () => ({
  default: {
    get: vi.fn().mockRejectedValue(new Error("No cookie")),
    post: vi.fn().mockResolvedValue({ data: {} }),
    create: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
    defaults: { withCredentials: false },
  },
}));

import axios from "axios";
const mockedAxios = vi.mocked(axios, true);

vi.mock("../../api/config", () => ({
    default: {
        backend: "http://localhost:8000/api/v1",
    },
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe("useAuth", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("devrait retourner le contexte d'authentification", async () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: Wrapper,
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
            wrapper: Wrapper,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(typeof result.current.login).toBe("function");
        expect(typeof result.current.logout).toBe("function");
    });

    it("devrait avoir les bons types pour les propriétés", async () => {
        const { result } = renderHook(() => useAuth(), {
            wrapper: Wrapper,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(typeof result.current.isAuthenticated).toBe("boolean");
        expect(result.current.user).toBeNull();
        expect(result.current.applications).toBeNull();
    });
});
