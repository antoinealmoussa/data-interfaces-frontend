import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";

vi.mock("../../api/config", () => ({
  default: {
    backend: "http://localhost:8000/api/v1",
  },
}));

describe("API Client", () => {
  let errorHandler: (error: unknown) => Promise<unknown>;
  let dispatchSpy: ReturnType<typeof vi.spyOn>;
  let mockedApiClient: Record<string, unknown>;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    const mod = await import("../../api/client");
    mockedApiClient = mod.default;

    errorHandler = mockedApiClient.interceptors.response.use.mock.calls[0][1];
    dispatchSpy = vi.spyOn(window, "dispatchEvent");
  });

  afterEach(() => {
    dispatchSpy?.mockRestore();
  });

  it("devrait être créé avec withCredentials", () => {
    expect(vi.mocked(axios.create)).toHaveBeenCalledWith(
      expect.objectContaining({ withCredentials: true }),
    );
  });

  it("devrait dispatcher auth:unauthorized pour une 401 sur endpoint non-auth", async () => {
    const refreshError = new Error("Token refresh failed");
    vi.mocked(axios.post).mockRejectedValueOnce(refreshError);

    const error = {
      response: { status: 401 },
      config: { url: "/users/me" },
    };

    await expect(errorHandler(error)).rejects.toEqual(error);
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: "auth:unauthorized" }),
    );
  });

  it("ne devrait PAS dispatcher auth:unauthorized pour une 401 sur /login", async () => {
    const error = {
      response: { status: 401 },
      config: { url: "/login" },
    };

    await expect(errorHandler(error)).rejects.toEqual(error);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("ne devrait PAS dispatcher auth:unauthorized pour une 401 sur /register", async () => {
    const error = {
      response: { status: 401 },
      config: { url: "/register" },
    };

    await expect(errorHandler(error)).rejects.toEqual(error);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("ne devrait PAS dispatcher auth:unauthorized pour une 401 sur /logout", async () => {
    const error = {
      response: { status: 401 },
      config: { url: "/logout" },
    };

    await expect(errorHandler(error)).rejects.toEqual(error);
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it("ne devrait pas dispatcher pour une erreur non-401", async () => {
    const error = {
      response: { status: 403 },
      config: { url: "/users/me" },
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
