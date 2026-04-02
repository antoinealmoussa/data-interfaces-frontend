import { describe, it, expect, beforeEach } from "vitest";
import { getAuthHeaders } from "../../api/config";

describe("getAuthHeaders", () => {
    beforeEach(() => {
        localStorage.removeItem("token");
    });

    it("devrait retourner un objet vide si aucun token n'est présent", () => {
        const headers = getAuthHeaders();
        expect(headers).toEqual({});
    });

    it("devrait retourner les headers avec le token si présent", () => {
        localStorage.setItem("token", "test-token-123");
        const headers = getAuthHeaders();
        expect(headers).toEqual({
            Authorization: "Bearer test-token-123"
        });
    });

    it("devrait inclure le token dans le format Bearer", () => {
        localStorage.setItem("token", "my-jwt-token");
        const headers = getAuthHeaders() as Record<string, string>;
        expect(headers.Authorization).toBe("Bearer my-jwt-token");
    });
});
