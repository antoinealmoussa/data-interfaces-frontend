import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockUseParams = vi.fn();

vi.mock("react-router-dom", () => ({
  useParams: mockUseParams,
}));

const mockedTeamApi = {
  getAll: vi.fn(),
};

vi.mock("../../../api/rugby-teams/teamApi", () => ({
  teamApi: mockedTeamApi,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useTeamAndSeason", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retourne loading=true pendant le chargement", async () => {
    mockedTeamApi.getAll.mockReturnValue(new Promise(() => {}));
    mockUseParams.mockReturnValue({ teamName: "Mon equipe", seasonName: "2025-2026" });

    const { useTeamAndSeason } = await import("../../../hooks/rugby-teams/useTeamAndSeason");
    const { result } = renderHook(() => useTeamAndSeason(), {
      wrapper: createWrapper(),
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.team).toBeNull();
    expect(result.current.season).toBeNull();
  });

  it("retourne l'équipe et la saison correspondant aux paramètres", async () => {
    mockUseParams.mockReturnValue({ teamName: "Mon equipe", seasonName: "2025-2026" });

    mockedTeamApi.getAll.mockResolvedValue([
      {
        id: 1,
        name: "Mon equipe",
        categories: ["Mixte"],
        user_id: 1,
        seasons: [{ id: 10, name: "2025-2026" }],
      },
      {
        id: 2,
        name: "Autre equipe",
        categories: ["+35"],
        user_id: 1,
        seasons: [{ id: 11, name: "2024-2025" }],
      },
    ]);

    const { useTeamAndSeason } = await import("../../../hooks/rugby-teams/useTeamAndSeason");
    const { result } = renderHook(() => useTeamAndSeason(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.team).toMatchObject({ id: 1, name: "Mon equipe" });
    expect(result.current.season).toMatchObject({ id: 10, name: "2025-2026" });
  });

  it("retourne team=null si le nom ne correspond pas", async () => {
    mockUseParams.mockReturnValue({ teamName: "inconnu", seasonName: "2025-2026" });

    mockedTeamApi.getAll.mockResolvedValue([
      {
        id: 1,
        name: "Mon equipe",
        categories: ["Mixte"],
        user_id: 1,
        seasons: [{ id: 10, name: "2025-2026" }],
      },
    ]);

    const { useTeamAndSeason } = await import("../../../hooks/rugby-teams/useTeamAndSeason");
    const { result } = renderHook(() => useTeamAndSeason(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.team).toBeNull();
    expect(result.current.season).toBeNull();
  });

  it("decodedTeamName décode les caractères encodés dans l'URL", async () => {
    mockUseParams.mockReturnValue({ teamName: "Mon%20equipe", seasonName: "2025-2026" });

    mockedTeamApi.getAll.mockResolvedValue([
      {
        id: 1,
        name: "Mon equipe",
        categories: ["Mixte"],
        user_id: 1,
        seasons: [{ id: 10, name: "2025-2026" }],
      },
    ]);

    const { useTeamAndSeason } = await import("../../../hooks/rugby-teams/useTeamAndSeason");
    const { result } = renderHook(() => useTeamAndSeason(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.team).toMatchObject({ id: 1, name: "Mon equipe" });
  });

  it("retourne un message d'erreur en cas d'echec de la requete", async () => {
    mockUseParams.mockReturnValue({ teamName: "Mon equipe", seasonName: "2025-2026" });

    mockedTeamApi.getAll.mockRejectedValue(new Error("Network error"));

    const { useTeamAndSeason } = await import("../../../hooks/rugby-teams/useTeamAndSeason");
    const { result } = renderHook(() => useTeamAndSeason(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Erreur lors du chargement des équipes");
  });
});
