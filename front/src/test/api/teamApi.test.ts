import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

vi.mock("../../api/config", () => ({
    default: {
        backend: "http://localhost:8000/api/v1",
    },
}));

describe("teamApi", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("getAll devrait appeler GET /teams", async () => {
        mockedAxios.get.mockResolvedValue({ data: [{ id: 1, name: "Team A" }] });

        const { teamApi } = await import("../../api/teamApi");
        const result = await teamApi.getAll();

        expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8000/api/v1/teams");
        expect(result.data).toEqual([{ id: 1, name: "Team A" }]);
    });

    it("getBySeason devrait appeler GET /teams/by-season/:id", async () => {
        mockedAxios.get.mockResolvedValue({ data: [{ id: 1, name: "Team B" }] });

        const { teamApi } = await import("../../api/teamApi");
        const result = await teamApi.getBySeason(42);

        expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8000/api/v1/teams/by-season/42");
        expect(result.data).toEqual([{ id: 1, name: "Team B" }]);
    });

    it("hasTeams devrait retourner true si des équipes existent", async () => {
        mockedAxios.get.mockResolvedValue({ data: true });

        const { teamApi } = await import("../../api/teamApi");
        const result = await teamApi.hasTeams();

        expect(mockedAxios.get).toHaveBeenCalledWith("http://localhost:8000/api/v1/teams/has-teams");
        expect(result).toBe(true);
    });

    it("hasTeams devrait retourner false si la requête échoue", async () => {
        mockedAxios.get.mockRejectedValue(new Error("Network error"));

        const { teamApi } = await import("../../api/teamApi");
        const result = await teamApi.hasTeams();

        expect(result).toBe(false);
    });

    it("create devrait appeler POST /teams avec les données", async () => {
        const newTeam = { name: "New Team", categories: ["Mixte"] as const, user_id: 1, season_name: "2025-2026" };
        mockedAxios.post.mockResolvedValue({ data: { id: 2, ...newTeam } });

        const { teamApi } = await import("../../api/teamApi");
        const result = await teamApi.create(newTeam);

        expect(mockedAxios.post).toHaveBeenCalledWith(
            "http://localhost:8000/api/v1/teams",
            newTeam
        );
        expect(result.data).toMatchObject({ name: "New Team" });
    });
});
