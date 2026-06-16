import { describe, it, expect, vi, beforeEach } from "vitest";

const mockedClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("../../api/client", () => ({
  default: mockedClient,
  teamPath: (teamName: string, ...segments: string[]) =>
    `/teams/${encodeURIComponent(teamName)}/${segments.join("/")}`,
}));

describe("playerApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getByTeam devrait appeler GET /teams/:teamName/players", async () => {
    mockedClient.get.mockResolvedValue({ data: [{ id: 1, name: "Jean" }] });

    const { playerApi } = await import("../../api/playerApi");
    const result = await playerApi.getByTeam("Mon equipe");

    expect(mockedClient.get).toHaveBeenCalledWith(
      "/teams/Mon%20equipe/players?skip=0&limit=100",
    );
    expect(result).toEqual([{ id: 1, name: "Jean" }]);
  });

  it("getByTeam devrait encoder le nom de l'équipe", async () => {
    mockedClient.get.mockResolvedValue({ data: [] });

    const { playerApi } = await import("../../api/playerApi");
    await playerApi.getByTeam("Équipe spéciale");

    expect(mockedClient.get).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("Équipe spéciale")),
    );
  });

  it("getByTeam devrait passer skip et limit", async () => {
    mockedClient.get.mockResolvedValue({ data: [] });

    const { playerApi } = await import("../../api/playerApi");
    await playerApi.getByTeam("Equipe", 10, 25);

    expect(mockedClient.get).toHaveBeenCalledWith(
      "/teams/Equipe/players?skip=10&limit=25",
    );
  });

  it("create devrait appeler POST /teams/:teamName/players", async () => {
    const newPlayer = {
      name: "Jean",
      level: 2,
      sex: "H" as const,
      position: "Ailier" as const,
      category_names: ["Mixte", "+35"],
    };
    mockedClient.post.mockResolvedValue({ data: { id: 1, ...newPlayer } });

    const { playerApi } = await import("../../api/playerApi");
    const result = await playerApi.create("Mon equipe", newPlayer);

    expect(mockedClient.post).toHaveBeenCalledWith(
      "/teams/Mon%20equipe/players",
      newPlayer,
    );
    expect(result).toMatchObject({ name: "Jean" });
  });

  it("update devrait appeler PUT /teams/:teamName/players/:playerId", async () => {
    const updateData = {
      name: "Jean Modifié",
      level: 3,
      sex: "F" as const,
      position: "Meneur" as const,
      category_names: ["+35"],
    };
    mockedClient.put.mockResolvedValue({ data: { id: 5, ...updateData } });

    const { playerApi } = await import("../../api/playerApi");
    const result = await playerApi.update("Mon equipe", 5, updateData);

    expect(mockedClient.put).toHaveBeenCalledWith(
      "/teams/Mon%20equipe/players/5",
      updateData,
    );
    expect(result).toMatchObject({ name: "Jean Modifié" });
  });

  it("delete devrait appeler DELETE /teams/:teamName/players/:playerId", async () => {
    mockedClient.delete.mockResolvedValue({});

    const { playerApi } = await import("../../api/playerApi");
    await playerApi.delete("Mon equipe", 3);

    expect(mockedClient.delete).toHaveBeenCalledWith(
      "/teams/Mon%20equipe/players/3",
    );
  });
});
