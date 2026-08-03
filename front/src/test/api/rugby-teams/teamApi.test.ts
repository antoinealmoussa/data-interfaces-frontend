import { describe, it, expect, vi, beforeEach } from "vitest";
import type { CreateTeamDto } from "../../../types/rugby-teams/teamTypes";

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

  it("create devrait appeler POST /rugby-teams/teams avec les données", async () => {
    const newTeam: CreateTeamDto = {
      name: "New Team",
      categories: ["Mixte"],
      season_name: "2025-2026",
    };
    mockedClient.post.mockResolvedValue({ data: { id: 2, ...newTeam } });

    const { teamApi } = await import("../../../api/rugby-teams/teamApi");
    const result = await teamApi.create(newTeam);

    expect(mockedClient.post).toHaveBeenCalledWith("/rugby-teams/teams", newTeam);
    expect(result).toMatchObject({ name: "New Team" });
  });
});
