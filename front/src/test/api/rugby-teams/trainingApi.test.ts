import { describe, it, expect, vi, beforeEach } from "vitest";

const mockedClient = {
  get: vi.fn(),
  post: vi.fn(),
};

vi.mock("../../../api/client", () => ({
  default: mockedClient,
  teamPath: (teamName: string, ...segments: string[]) =>
    `/rugby-teams/teams/${encodeURIComponent(teamName)}/${segments.join("/")}`,
}));

describe("trainingApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAlgorithms devrait appeler GET /rugby-teams/teams/:teamName/training/algorithms", async () => {
    mockedClient.get.mockResolvedValue({
      data: [
        { id: "balanced", label: "Équilibré" },
        { id: "random", label: "Aléatoire" },
      ],
    });

    const { trainingApi } = await import("../../../api/rugby-teams/trainingApi");
    const result = await trainingApi.getAlgorithms("Mon equipe");

    expect(mockedClient.get).toHaveBeenCalledWith(
      "/rugby-teams/teams/Mon%20equipe/training/algorithms",
    );
    expect(result).toEqual([
      { id: "balanced", label: "Équilibré" },
      { id: "random", label: "Aléatoire" },
    ]);
  });

  it("getAlgorithms devrait encoder le nom de l'équipe", async () => {
    mockedClient.get.mockResolvedValue({ data: [] });

    const { trainingApi } = await import("../../../api/rugby-teams/trainingApi");
    await trainingApi.getAlgorithms("Équipe spéciale");

    expect(mockedClient.get).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("Équipe spéciale")),
    );
  });

  it("distribute devrait appeler POST /rugby-teams/teams/:teamName/training/distribute", async () => {
    const request = {
      player_ids: [1, 2, 3],
      team_count: 2,
      algorithm: "balanced",
    };
    mockedClient.post.mockResolvedValue({
      data: {
        teams: [
          { id: 1, name: "Équipe 1", players: [] },
          { id: 2, name: "Équipe 2", players: [] },
        ],
      },
    });

    const { trainingApi } = await import("../../../api/rugby-teams/trainingApi");
    const result = await trainingApi.distribute("Mon equipe", request);

    expect(mockedClient.post).toHaveBeenCalledWith(
      "/rugby-teams/teams/Mon%20equipe/training/distribute",
      request,
    );
    expect(result.teams).toHaveLength(2);
  });
});
