import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockedClient = vi.hoisted(() => ({
  get: vi.fn().mockRejectedValue(new Error("No mock")),
  post: vi.fn().mockRejectedValue(new Error("No mock")),
}));

vi.mock("../../api/client", () => ({
  default: mockedClient,
}));

import { renderHook, act, waitFor, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import { useAuth } from "../../hooks/useAuth";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("devrait s'initialiser avec isLoading à false et isAuthenticated à false quand pas de cookie", async () => {
    mockedClient.get.mockRejectedValueOnce(new Error("No cookie"));

    const { result } = renderHook(() => useAuth(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("devrait mettre à jour l'état après un login", async () => {
    mockedClient.get
      .mockResolvedValueOnce({
        data: {
          user: {
            id: 1,
            email: "test@mail.com",
            first_name: "Test",
            surname: "test",
            role: "normal_user",
          },
          applications: [],
        },
      })
      .mockResolvedValueOnce({
        data: {
          user: {
            id: 1,
            email: "test@mail.com",
            first_name: "Test",
            surname: "test",
            role: "normal_user",
          },
          applications: [],
        },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login();
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    expect(result.current.user?.id).toBe(1);
    expect(result.current.user?.email).toBe("test@mail.com");
    expect(result.current.user?.first_name).toBe("Test");
    expect(result.current.user?.surname).toBe("test");
    expect(result.current.user?.role).toBe("normal_user");
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.hasRole("normal_user")).toBe(true);
    expect(result.current.hasRole("admin")).toBe(false);
  });

  it("devrait exposer isAdmin pour un utilisateur admin", async () => {
    mockedClient.get
      .mockResolvedValueOnce({
        data: {
          user: {
            id: 1,
            email: "admin@mail.com",
            first_name: "Admin",
            surname: "User",
            role: "admin",
          },
          applications: [],
        },
      })
      .mockResolvedValueOnce({
        data: {
          user: {
            id: 1,
            email: "admin@mail.com",
            first_name: "Admin",
            surname: "User",
            role: "admin",
          },
          applications: [],
        },
      });

    const { result } = renderHook(() => useAuth(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login();
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.hasRole("admin")).toBe(true);
  });

  it("devrait réinitialiser l'état après un login puis un logout", async () => {
    mockedClient.get
      .mockResolvedValueOnce({
        data: {
          user: {
            id: 1,
            email: "test@mail.com",
            first_name: "Test",
            surname: "test",
            role: "normal_user",
          },
          applications: [],
        },
      })
      .mockResolvedValueOnce({
        data: {
          user: {
            id: 1,
            email: "test@mail.com",
            first_name: "Test",
            surname: "test",
            role: "normal_user",
          },
          applications: [],
        },
      });

    mockedClient.post.mockResolvedValueOnce({
      data: { message: "Logged out" },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.login();
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

  it("devrait charger l'état depuis l'API au démarrage", async () => {
    mockedClient.get.mockResolvedValueOnce({
      data: {
        user: {
          id: 2,
          email: "cookie@mail.com",
          first_name: "Cookie",
          surname: "User",
          role: "normal_user",
        },
        applications: [{ name: "test-app", pretty_name: "Test App" }],
      },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: Wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });
    expect(result.current.user?.id).toBe(2);
    expect(result.current.user?.email).toBe("cookie@mail.com");
  });
});
