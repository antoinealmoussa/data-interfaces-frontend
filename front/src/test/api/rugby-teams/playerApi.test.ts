import { describe, it, expect, vi, beforeEach } from "vitest";

const mockedClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("../../../api/client", () => ({
  default: mockedClient,
  teamPath: (teamName: string, ...segments: string[]) =>
    `/rugby-teams/teams/${encodeURIComponent(teamName)}/${segments.join("/")}`,
}));

describe("playerApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getByTeam devrait appeler GET avec season_id", async () => {
    mockedClient.get.mockResolvedValue({ data: [{ id: 1, name: "Jean" }] });

    const { playerApi } = await import("../../../api/rugby-teams/playerApi");
    const result = await playerApi.getByTeam("Mon equipe", 3);

    expect(mockedClient.get).toHaveBeenCalledWith(
      "/rugby-teams/teams/Mon%20equipe/players?season_id=3&skip=0&limit=100",
    );
    expect(result).toEqual([{ id: 1, name: "Jean" }]);
  });

  it("getByTeam devrait encoder le nom de l'équipe", async () => {
    mockedClient.get.mockResolvedValue({ data: [] });

    const { playerApi } = await import("../../../api/rugby-teams/playerApi");
    await playerApi.getByTeam("Équipe spéciale", 1);

    expect(mockedClient.get).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("Équipe spéciale")),
    );
  });

  it("getByTeam devrait passer skip et limit", async () => {
    mockedClient.get.mockResolvedValue({ data: [] });

    const { playerApi } = await import("../../../api/rugby-teams/playerApi");
    await playerApi.getByTeam("Equipe", 4, 10, 25);

    expect(mockedClient.get).toHaveBeenCalledWith(
      "/rugby-teams/teams/Equipe/players?season_id=4&skip=10&limit=25",
    );
  });

  it("create devrait appeler POST avec season_id", async () => {
    const newPlayer = {
      name: "Jean",
      level: 2,
      sex: "H" as const,
      position: "Ailier" as const,
      category_names: ["Mixte", "+35"],
    };
    mockedClient.post.mockResolvedValue({ data: { id: 1, ...newPlayer } });

    const { playerApi } = await import("../../../api/rugby-teams/playerApi");
    const result = await playerApi.create("Mon equipe", 3, newPlayer);

    expect(mockedClient.post).toHaveBeenCalledWith(
      "/rugby-teams/teams/Mon%20equipe/players?season_id=3",
      newPlayer,
    );
    expect(result).toMatchObject({ name: "Jean" });
  });

  it("update devrait appeler PUT avec season_id", async () => {
    const updateData = {
      name: "Jean Modifié",
      level: 3,
      sex: "F" as const,
      position: "Meneur" as const,
      category_names: ["+35"],
    };
    mockedClient.put.mockResolvedValue({ data: { id: 5, ...updateData } });

    const { playerApi } = await import("../../../api/rugby-teams/playerApi");
    const result = await playerApi.update("Mon equipe", 3, 5, updateData);

    expect(mockedClient.put).toHaveBeenCalledWith(
      "/rugby-teams/teams/Mon%20equipe/players/5?season_id=3",
      updateData,
    );
    expect(result).toMatchObject({ name: "Jean Modifié" });
  });

  it("delete devrait appeler DELETE avec season_id", async () => {
    mockedClient.delete.mockResolvedValue({});

    const { playerApi } = await import("../../../api/rugby-teams/playerApi");
    await playerApi.delete("Mon equipe", 3, 7);

    expect(mockedClient.delete).toHaveBeenCalledWith(
      "/rugby-teams/teams/Mon%20equipe/players/7?season_id=3",
    );
  });
});