import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider } from "../../contexts/AuthContext";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

vi.mock("../../api/config", () => ({
  default: {
    backend: "http://localhost:8000/api/v1",
  },
  getAuthHeaders: () => ({ Authorization: "Bearer test-token" }),
}));

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("devrait s'initialiser avec isLoading à false et isAuthenticated à false quand pas de token", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("No token"));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("devrait mettre à jour l'état après un login", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        user: {
          id: 1,
          email: "test@mail.com",
          first_name: "Test",
          surname: "test",
        },
        applications: [],
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login("test-token");
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    expect(result.current.user?.id).toBe(1);
    expect(result.current.user?.email).toBe("test@mail.com");
    expect(result.current.user?.first_name).toBe("Test");
    expect(result.current.user?.surname).toBe("test");
  });

  it("devrait réinitialiser l'état après un login puis un logout", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        user: {
          id: 1,
          email: "test@mail.com",
          first_name: "Test",
          surname: "test",
        },
        applications: [],
      },
    });

    mockedAxios.post.mockResolvedValueOnce({
      data: { message: "Logged out" },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login("test-token");
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("devrait valider le token et charger l'état depuis l'API", async () => {
    localStorage.setItem("token", "stored-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 2,
        email: "stored@mail.com",
        first_name: "Stored",
        surname: "User",
      }),
    );
    localStorage.setItem(
      "applications",
      JSON.stringify([{ name: "test-app", pretty_name: "Test App" }]),
    );

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        user: {
          id: 2,
          email: "stored@mail.com",
          first_name: "Stored",
          surname: "User",
        },
        applications: [{ name: "test-app", pretty_name: "Test App" }],
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });
    expect(result.current.user?.id).toBe(2);
    expect(result.current.user?.email).toBe("stored@mail.com");
    expect(result.current.token).toBe("stored-token");
  });

  it("devrait effacer le localStorage si le token est invalide", async () => {
    localStorage.setItem("token", "invalid-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 2,
        email: "stored@mail.com",
        first_name: "Stored",
        surname: "User",
      }),
    );
    localStorage.setItem(
      "applications",
      JSON.stringify([{ name: "test-app", pretty_name: "Test App" }]),
    );

    mockedAxios.get.mockRejectedValueOnce(new Error("Invalid token"));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("applications")).toBeNull();
  });
});
