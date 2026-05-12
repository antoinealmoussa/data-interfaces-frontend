import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    defaults: { withCredentials: false },
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
    create: vi.fn(),
  },
}));

describe("API Config", () => {
    let errorHandler: (error: any) => Promise<any>;
    let dispatchSpy: vi.SpyInstance;

    beforeEach(async () => {
        vi.clearAllMocks();
        vi.resetModules();
        await import("../../api/config");

        errorHandler = vi.mocked(axios.interceptors.response.use).mock.calls[0][1];
        dispatchSpy = vi.spyOn(window, "dispatchEvent");
    });

    afterEach(() => {
        dispatchSpy.mockRestore();
    });

    it("devrait être configuré avec withCredentials", () => {
        expect(axios.defaults.withCredentials).toBe(true);
    });

    it("devrait dispatcher auth:unauthorized pour une 401 sur endpoint non-auth", async () => {
        const error = {
            response: { status: 401 },
            config: { url: "/api/v1/users/me" },
        };

        await expect(errorHandler(error)).rejects.toEqual(error);
        expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({ type: "auth:unauthorized" })
        );
    });

    it("ne devrait PAS dispatcher auth:unauthorized pour une 401 sur /login", async () => {
        const error = {
            response: { status: 401 },
            config: { url: "/api/v1/login" },
        };

        await expect(errorHandler(error)).rejects.toEqual(error);
        expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it("ne devrait PAS dispatcher auth:unauthorized pour une 401 sur /register", async () => {
        const error = {
            response: { status: 401 },
            config: { url: "/api/v1/register" },
        };

        await expect(errorHandler(error)).rejects.toEqual(error);
        expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it("ne devrait PAS dispatcher auth:unauthorized pour une 401 sur /logout", async () => {
        const error = {
            response: { status: 401 },
            config: { url: "/api/v1/logout" },
        };

        await expect(errorHandler(error)).rejects.toEqual(error);
        expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it("ne devrait pas dispatcher pour une erreur non-401", async () => {
        const error = {
            response: { status: 403 },
            config: { url: "/api/v1/users/me" },
        };

        await expect(errorHandler(error)).rejects.toEqual(error);
        expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it("devrait propager la promesse rejetée pour une erreur sans response", async () => {
        const error = new Error("Network Error");

        await expect(errorHandler(error)).rejects.toEqual(error);
        expect(dispatchSpy).not.toHaveBeenCalled();
    });
});
