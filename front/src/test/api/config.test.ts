import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios");

describe("API Config", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    it("devrait être configuré avec withCredentials", async () => {
        const { default: config } = await import("../../api/config");
        expect(axios.defaults.withCredentials).toBe(true);
    });
});
