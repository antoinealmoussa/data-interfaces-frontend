import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CreateSeasonDto } from "../../../types/rugby-teams/seasonTypes";

const mockedClient = {
  post: vi.fn(),
};

vi.mock("../../../api/client", () => ({
  default: mockedClient,
  teamPath: (teamName: string, ...segments: string[]) =>
    `/rugby-teams/teams/${encodeURIComponent(teamName)}/${segments.join("/")}`,
}));

describe("seasonApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createForTeam devrait appeler POST /rugby-teams/teams/:teamName/seasons", async () => {
    const newSeason: CreateSeasonDto = {
      name: "2026-2027",
      player_ids: [1, 2, 3],
    };
    mockedClient.post.mockResolvedValue({
      data: {
        id: 1,
        name: "Mon equipe",
        categories: ["Mixte"],
        user_id: 1,
        seasons: [{ id: 2, name: "2025-2026" }, { id: 3, name: "2026-2027" }],
      },
    });

    const { seasonApi } = await import("../../../api/rugby-teams/seasonApi");
    const result = await seasonApi.createForTeam("Mon equipe", newSeason);

    expect(mockedClient.post).toHaveBeenCalledWith(
      "/rugby-teams/teams/Mon%20equipe/seasons",
      newSeason,
    );
    expect(result.seasons.map((s) => s.name)).toContain("2026-2027");
  });

  it("createForTeam devrait encoder le nom de l'équipe", async () => {
    mockedClient.post.mockResolvedValue({ data: { seasons: [] } });

    const { seasonApi } = await import("../../../api/rugby-teams/seasonApi");
    await seasonApi.createForTeam("Équipe spéciale", { name: "2026-2027", player_ids: [] });

    expect(mockedClient.post).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("Équipe spéciale")),
      expect.anything(),
    );
  });
});