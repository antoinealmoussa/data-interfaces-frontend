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

describe("tournamentApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getByTeam devrait appeler GET avec season_id", async () => {
    mockedClient.get.mockResolvedValue({ data: [{ id: 1, name: "Tournoi A" }] });

    const { tournamentApi } = await import("../../../api/rugby-teams/tournamentApi");
    const result = await tournamentApi.getByTeam("Mon equipe", 3);

    expect(mockedClient.get).toHaveBeenCalledWith(
      "/rugby-teams/teams/Mon%20equipe/tournaments?season_id=3",
    );
    expect(result).toEqual([{ id: 1, name: "Tournoi A" }]);
  });

  it("getByTeam devrait encoder le nom de l'équipe", async () => {
    mockedClient.get.mockResolvedValue({ data: [] });

    const { tournamentApi } = await import("../../../api/rugby-teams/tournamentApi");
    await tournamentApi.getByTeam("Équipe spéciale", 1);

    expect(mockedClient.get).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("Équipe spéciale")),
    );
  });

  it("create devrait appeler POST avec season_id", async () => {
    const newTournament = {
      name: "Tournoi Test",
      category_name: "Mixte",
      player_names: ["Jean", "Marie"],
    };
    mockedClient.post.mockResolvedValue({
      data: { id: 1, ...newTournament },
    });

    const { tournamentApi } = await import("../../../api/rugby-teams/tournamentApi");
    const result = await tournamentApi.create("Mon equipe", 3, newTournament);

    expect(mockedClient.post).toHaveBeenCalledWith(
      "/rugby-teams/teams/Mon%20equipe/tournaments?season_id=3",
      newTournament,
    );
    expect(result).toMatchObject({ name: "Tournoi Test" });
  });

  it("update devrait appeler PUT avec season_id", async () => {
    const updateData = {
      name: "Tournoi Modifié",
      category_name: "+35",
      player_names: ["Jean"],
    };
    mockedClient.put.mockResolvedValue({
      data: { id: 5, ...updateData },
    });

    const { tournamentApi } = await import("../../../api/rugby-teams/tournamentApi");
    const result = await tournamentApi.update("Mon equipe", 3, 5, updateData);

    expect(mockedClient.put).toHaveBeenCalledWith(
      "/rugby-teams/teams/Mon%20equipe/tournaments/5?season_id=3",
      updateData,
    );
    expect(result).toMatchObject({ name: "Tournoi Modifié" });
  });

  it("delete devrait appeler DELETE avec season_id", async () => {
    mockedClient.delete.mockResolvedValue({});

    const { tournamentApi } = await import("../../../api/rugby-teams/tournamentApi");
    await tournamentApi.delete("Mon equipe", 3, 7);

    expect(mockedClient.delete).toHaveBeenCalledWith(
      "/rugby-teams/teams/Mon%20equipe/tournaments/7?season_id=3",
    );
  });
});