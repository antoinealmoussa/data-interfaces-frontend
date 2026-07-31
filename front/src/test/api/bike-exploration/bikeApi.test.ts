import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockedClient = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
};

vi.mock("../../../api/client", () => ({
  default: mockedClient,
}));

vi.mock("../../../api/config", () => ({
  default: { backend: "/api/v1" },
}));

describe("bikeApi", () => {
  let bikeApi: typeof import("../../../api/bike-exploration/bikeApi")["bikeApi"];
  let streamProgress: (
    taskId: string,
    onEvent: (event: unknown) => void,
  ) => Promise<void>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import("../../../api/bike-exploration/bikeApi");
    bikeApi = mod.bikeApi;
    streamProgress = bikeApi.streamProgress as unknown as typeof streamProgress;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uploadFile devrait envoyer un POST multipart avec le fichier", async () => {
    const file = new File(["content"], "activities.zip");
    mockedClient.post.mockResolvedValue({ data: { task_id: "task-1" } });

    const result = await bikeApi.uploadFile(file);

    expect(mockedClient.post).toHaveBeenCalledTimes(1);
    const [url, form] = mockedClient.post.mock.calls[0] as [
      string,
      FormData,
    ];
    expect(url).toBe("/bike-exploration/activities/upload");
    expect(form.get("file")).toBe(file);
    expect(result).toEqual({ task_id: "task-1" });
  });

  it("cancelTask devrait envoyer un DELETE avec le task id", async () => {
    mockedClient.delete.mockResolvedValue({ data: undefined });

    await bikeApi.cancelTask("task-1");

    expect(mockedClient.delete).toHaveBeenCalledWith(
      "/bike-exploration/activities/upload/task-1",
    );
  });

  it("getCols devrait récupérer la liste des cols", async () => {
    mockedClient.get.mockResolvedValue({ data: [{ id: 1, name: "Col" }] });

    const result = await bikeApi.getCols();

    expect(mockedClient.get).toHaveBeenCalledWith("/bike-exploration/cols");
    expect(result).toEqual([{ id: 1, name: "Col" }]);
  });

  it("getConqueredCols devrait récupérer les cols gravis", async () => {
    mockedClient.get.mockResolvedValue({ data: [{ id: 2, name: "Col 2" }] });

    const result = await bikeApi.getConqueredCols();

    expect(mockedClient.get).toHaveBeenCalledWith(
      "/bike-exploration/cols/conquered",
    );
    expect(result).toEqual([{ id: 2, name: "Col 2" }]);
  });

  it("resetActivities devrait envoyer un DELETE sur /activities", async () => {
    mockedClient.delete.mockResolvedValue({ data: undefined });

    await bikeApi.resetActivities();

    expect(mockedClient.delete).toHaveBeenCalledWith(
      "/bike-exploration/activities",
    );
  });

  it("streamProgress devrait parser les événements SSE", async () => {
    const chunks = [
      "data: {\"type\":\"start\",\"total\":2}\n",
      "data: {\"type\":\"progress\",\"current\":1,\"total\":2,\"name\":\"act\"}\n",
      "data: {\"type\":\"complete\",\"created\":1,\"skipped\":1,\"failed\":0,\"cols\":[]}\n",
    ];
    const onEvent = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: new ReadableStream<Uint8Array>({
          start(controller) {
            const encoder = new TextEncoder();
            chunks.forEach((c) => controller.enqueue(encoder.encode(c)));
            controller.close();
          },
        }),
      }),
    );

    await streamProgress("task-1", onEvent);

    expect(fetch).toHaveBeenCalledWith("/api/v1/bike-exploration/activities/upload/task-1/progress", {
      credentials: "include",
    });
    expect(onEvent).toHaveBeenNthCalledWith(1, { type: "start", total: 2 });
    expect(onEvent).toHaveBeenNthCalledWith(2, {
      type: "progress",
      current: 1,
      total: 2,
      name: "act",
    });
    expect(onEvent).toHaveBeenNthCalledWith(3, {
      type: "complete",
      created: 1,
      skipped: 1,
      failed: 0,
      cols: [],
    });
  });

  it("streamProgress devrait ignorer les lignes non 'data:' et les JSON invalides", async () => {
    const chunks = [
      ": commentaire\n",
      "data: {not-json\n",
      "\n",
      "data: {\"type\":\"cancelled\",\"created\":0,\"skipped\":0,\"failed\":0}\n",
    ];
    const onEvent = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: new ReadableStream<Uint8Array>({
          start(controller) {
            const encoder = new TextEncoder();
            chunks.forEach((c) => controller.enqueue(encoder.encode(c)));
            controller.close();
          },
        }),
      }),
    );

    await streamProgress("task-1", onEvent);

    expect(onEvent).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenNthCalledWith(1, {
      type: "cancelled",
      created: 0,
      skipped: 0,
      failed: 0,
    });
  });

  it("streamProgress devrait gérer un événement découpé entre deux chunks", async () => {
    const onEvent = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: new ReadableStream<Uint8Array>({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode("data: {\"type\":\"star"));
            controller.enqueue(encoder.encode("t\",\"total\":1}\n"));
            controller.close();
          },
        }),
      }),
    );

    await streamProgress("task-1", onEvent);

    expect(onEvent).toHaveBeenNthCalledWith(1, { type: "start", total: 1 });
  });

  it("streamProgress devrait lever une erreur si la réponse n'est pas ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, body: null }),
    );

    await expect(streamProgress("task-1", vi.fn())).rejects.toThrow(
      "Progress stream failed: 500",
    );
  });

  it("streamProgress devrait lever une erreur si le body est absent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, status: 200, body: null }),
    );

    await expect(streamProgress("task-1", vi.fn())).rejects.toThrow(
      "Progress stream failed: 200",
    );
  });
});
