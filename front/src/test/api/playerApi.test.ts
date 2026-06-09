import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

const mockedAxios = vi.mocked(axios, true);

vi.mock("../../api/config", () => ({
  default: {
    backend: "http://localhost:8000/api/v1",
  },
}));

describe("playerApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getByTeam devrait appeler GET /teams/:teamName/players", async () => {
    mockedAxios.get.mockResolvedValue({ data: [{ id: 1, name: "Jean" }] });

    const { playerApi } = await import("../../api/playerApi");
    const result = await playerApi.getByTeam("Mon equipe");

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/teams/Mon%20equipe/players?skip=0&limit=100",
    );
    expect(result).toEqual([{ id: 1, name: "Jean" }]);
  });

  it("getByTeam devrait encoder le nom de l'équipe", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    const { playerApi } = await import("../../api/playerApi");
    await playerApi.getByTeam("Équipe spéciale");

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent("Équipe spéciale")),
    );
  });

  it("getByTeam devrait passer skip et limit", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });

    const { playerApi } = await import("../../api/playerApi");
    await playerApi.getByTeam("Equipe", 10, 25);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/teams/Equipe/players?skip=10&limit=25",
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
    mockedAxios.post.mockResolvedValue({ data: { id: 1, ...newPlayer } });

    const { playerApi } = await import("../../api/playerApi");
    const result = await playerApi.create("Mon equipe", newPlayer);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/teams/Mon%20equipe/players",
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
    mockedAxios.put.mockResolvedValue({ data: { id: 5, ...updateData } });

    const { playerApi } = await import("../../api/playerApi");
    const result = await playerApi.update("Mon equipe", 5, updateData);

    expect(mockedAxios.put).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/teams/Mon%20equipe/players/5",
      updateData,
    );
    expect(result).toMatchObject({ name: "Jean Modifié" });
  });

  it("delete devrait appeler DELETE /teams/:teamName/players/:playerId", async () => {
    mockedAxios.delete.mockResolvedValue({});

    const { playerApi } = await import("../../api/playerApi");
    await playerApi.delete("Mon equipe", 3);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      "http://localhost:8000/api/v1/teams/Mon%20equipe/players/3",
    );
  });
});
