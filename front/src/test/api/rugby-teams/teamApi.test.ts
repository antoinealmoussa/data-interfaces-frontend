import { describe, it, expect, vi, beforeEach } from "vitest";

const mockedClient = {
  get: vi.fn(),
  post: vi.fn(),
};

vi.mock("../../../api/client", () => ({
  default: mockedClient,
}));

describe("teamApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAll devrait appeler GET /rugby-teams/teams", async () => {
    mockedClient.get.mockResolvedValue({ data: [{ id: 1, name: "Team A" }] });

    const { teamApi } = await import("../../../api/rugby-teams/teamApi");
    const result = await teamApi.getAll();

    expect(mockedClient.get).toHaveBeenCalledWith("/rugby-teams/teams");
    expect(result).toEqual([{ id: 1, name: "Team A" }]);
  });

  it("getBySeason devrait appeler GET /rugby-teams/teams/by-season/:id", async () => {
    mockedClient.get.mockResolvedValue({ data: [{ id: 1, name: "Team B" }] });

    const { teamApi } = await import("../../../api/rugby-teams/teamApi");
    const result = await teamApi.getBySeason(42);

    expect(mockedClient.get).toHaveBeenCalledWith("/rugby-teams/teams/by-season/42");
    expect(result).toEqual([{ id: 1, name: "Team B" }]);
  });

  it("hasTeams devrait retourner true si des équipes existent", async () => {
    mockedClient.get.mockResolvedValue({ data: true });

    const { teamApi } = await import("../../../api/rugby-teams/teamApi");
    const result = await teamApi.hasTeams();

    expect(mockedClient.get).toHaveBeenCalledWith("/rugby-teams/teams/has-teams");
    expect(result).toBe(true);
  });

  it("hasTeams devrait retourner false si la requête échoue", async () => {
    mockedClient.get.mockRejectedValue(new Error("Network error"));

    const { teamApi } = await import("../../../api/rugby-teams/teamApi");
    const result = await teamApi.hasTeams();

    expect(result).toBe(false);
  });

  it("create devrait appeler POST /rugby-teams/teams avec les données", async () => {
    const newTeam = {
      name: "New Team",
      categories: ["Mixte"] as const,
      user_id: 1,
      season_name: "2025-2026",
    };
    mockedClient.post.mockResolvedValue({ data: { id: 2, ...newTeam } });

    const { teamApi } = await import("../../../api/rugby-teams/teamApi");
    const result = await teamApi.create(newTeam);

    expect(mockedClient.post).toHaveBeenCalledWith("/rugby-teams/teams", newTeam);
    expect(result).toMatchObject({ name: "New Team" });
  });
});
