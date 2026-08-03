import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type {
  UploadComplete,
  UploadEvent,
} from "../../../api/bike-exploration/bikeApi";

const mockedBikeApi = {
  getCols: vi.fn(),
  getConqueredCols: vi.fn(),
  uploadFile: vi.fn(),
  streamProgress: vi.fn(),
  cancelTask: vi.fn(),
};

vi.mock("../../../api/bike-exploration/bikeApi", () => ({
  bikeApi: mockedBikeApi,
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    queryClient,
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
};

const makeFile = () => new File(["content"], "activities.zip");

describe("useAllCols", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait charger les cols", async () => {
    mockedBikeApi.getCols.mockResolvedValue([{ id: 1, name: "Col" }]);
    const { wrapper } = createWrapper();

    const { useAllCols } = await import("../../../hooks/bike-exploration/useBikeExploration");
    const { result } = renderHook(() => useAllCols(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedBikeApi.getCols).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual([{ id: 1, name: "Col" }]);
  });
});

describe("useConqueredCols", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait charger les cols gravis", async () => {
    mockedBikeApi.getConqueredCols.mockResolvedValue([{ id: 2, name: "Col 2" }]);
    const { wrapper } = createWrapper();

    const { useConqueredCols } = await import("../../../hooks/bike-exploration/useBikeExploration");
    const { result } = renderHook(() => useConqueredCols(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedBikeApi.getConqueredCols).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual([{ id: 2, name: "Col 2" }]);
  });
});

describe("useUploadActivities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait parcourir start/progress/complete", async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    mockedBikeApi.uploadFile.mockResolvedValue({ task_id: "task-1" });
    mockedBikeApi.streamProgress.mockImplementation(
      async (_taskId: string, onEvent: (e: UploadEvent) => void) => {
        onEvent({ type: "start", total: 2 });
        onEvent({ type: "progress", current: 1, total: 2, name: "act" });
        onEvent({
          type: "complete",
          created: 1,
          skipped: 1,
          failed: 0,
          cols: [],
        });
      },
    );

    const { useUploadActivities } = await import("../../../hooks/bike-exploration/useBikeExploration");
    const { result } = renderHook(() => useUploadActivities(), { wrapper });

    await act(async () => {
      await result.current.mutate(makeFile());
    });

    expect(mockedBikeApi.uploadFile).toHaveBeenCalledTimes(1);
    expect(mockedBikeApi.streamProgress).toHaveBeenCalledWith(
      "task-1",
      expect.any(Function),
    );
    expect(result.current.phase).toBe("idle");
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.progress).toBeNull();
    expect(result.current.result).toMatchObject({
      type: "complete",
      created: 1,
      skipped: 1,
      failed: 0,
    });
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["be", "cols", "conquered"],
    });
  });

  it("devrait gérer un événement cancelled", async () => {
    const { queryClient, wrapper } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    mockedBikeApi.uploadFile.mockResolvedValue({ task_id: "task-1" });
    mockedBikeApi.streamProgress.mockImplementation(
      async (_taskId: string, onEvent: (e: UploadEvent) => void) => {
        onEvent({
          type: "cancelled",
          created: 0,
          skipped: 0,
          failed: 0,
        });
      },
    );

    const { useUploadActivities } = await import("../../../hooks/bike-exploration/useBikeExploration");
    const { result } = renderHook(() => useUploadActivities(), { wrapper });

    await act(async () => {
      await result.current.mutate(makeFile());
    });

    expect(result.current.phase).toBe("idle");
    expect(result.current.result).toBeNull();
    expect(result.current.progress).toBeNull();
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["be", "cols", "conquered"],
    });
  });

  it("devrait gérer un événement error du stream", async () => {
    mockedBikeApi.uploadFile.mockResolvedValue({ task_id: "task-1" });
    mockedBikeApi.streamProgress.mockImplementation(
      async (_taskId: string, onEvent: (e: UploadEvent) => void) => {
        onEvent({ type: "error", message: "Fichier invalide" });
      },
    );

    const { wrapper } = createWrapper();
    const { useUploadActivities } = await import("../../../hooks/bike-exploration/useBikeExploration");
    const { result } = renderHook(() => useUploadActivities(), { wrapper });

    await act(async () => {
      await result.current.mutate(makeFile());
    });

    expect(result.current.phase).toBe("idle");
    expect(result.current.error).toBe("Fichier invalide");
    expect(result.current.progress).toBeNull();
  });

  it("devrait signaler une connexion perdue quand le stream se termine sans événement terminal", async () => {
    mockedBikeApi.uploadFile.mockResolvedValue({ task_id: "task-1" });
    mockedBikeApi.streamProgress.mockResolvedValue(undefined);

    const { wrapper } = createWrapper();
    const { useUploadActivities } = await import("../../../hooks/bike-exploration/useBikeExploration");
    const { result } = renderHook(() => useUploadActivities(), { wrapper });

    await act(async () => {
      await result.current.mutate(makeFile());
    });

    expect(result.current.phase).toBe("idle");
    expect(result.current.error).toBe("La connexion avec le serveur a été perdue");
  });

  it("devrait gérer une erreur lors de l'upload du fichier", async () => {
    mockedBikeApi.uploadFile.mockRejectedValue(new Error("Upload failed"));

    const { wrapper } = createWrapper();
    const { useUploadActivities } = await import("../../../hooks/bike-exploration/useBikeExploration");
    const { result } = renderHook(() => useUploadActivities(), { wrapper });

    await act(async () => {
      await result.current.mutate(makeFile());
    });

    expect(result.current.phase).toBe("idle");
    expect(result.current.error).toBe("Upload failed");
  });

  it("devrait utiliser un message générique pour une erreur inconnue", async () => {
    mockedBikeApi.uploadFile.mockRejectedValue("raw string");

    const { wrapper } = createWrapper();
    const { useUploadActivities } = await import("../../../hooks/bike-exploration/useBikeExploration");
    const { result } = renderHook(() => useUploadActivities(), { wrapper });

    await act(async () => {
      await result.current.mutate(makeFile());
    });

    expect(result.current.error).toBe("Erreur inconnue");
  });

  it("cancel devrait annuler la tâche en cours", async () => {
    mockedBikeApi.uploadFile.mockResolvedValue({ task_id: "task-1" });
    mockedBikeApi.streamProgress.mockImplementation(
      () => new Promise<UploadComplete>(() => {}),
    );
    mockedBikeApi.cancelTask.mockResolvedValue(undefined);

    const { wrapper } = createWrapper();
    const { useUploadActivities } = await import("../../../hooks/bike-exploration/useBikeExploration");
    const { result } = renderHook(() => useUploadActivities(), { wrapper });

    act(() => {
      void result.current.mutate(makeFile());
    });

    await waitFor(() => expect(result.current.phase).toBe("processing"));

    await act(async () => {
      await result.current.cancel();
    });

    expect(mockedBikeApi.cancelTask).toHaveBeenCalledWith("task-1");
    expect(result.current.phase).toBe("cancelling");
  });

  it("cancel ne devrait rien faire sans tâche en cours", async () => {
    const { wrapper } = createWrapper();
    const { useUploadActivities } = await import("../../../hooks/bike-exploration/useBikeExploration");
    const { result } = renderHook(() => useUploadActivities(), { wrapper });

    await act(async () => {
      await result.current.cancel();
    });

    expect(mockedBikeApi.cancelTask).not.toHaveBeenCalled();
    expect(result.current.phase).toBe("idle");
  });

  it("cancel devrait revenir à idle si l'annulation échoue", async () => {
    mockedBikeApi.uploadFile.mockResolvedValue({ task_id: "task-1" });
    mockedBikeApi.streamProgress.mockImplementation(
      () => new Promise<UploadComplete>(() => {}),
    );
    mockedBikeApi.cancelTask.mockRejectedValue(new Error("cancel failed"));

    const { wrapper } = createWrapper();
    const { useUploadActivities } = await import("../../../hooks/bike-exploration/useBikeExploration");
    const { result } = renderHook(() => useUploadActivities(), { wrapper });

    act(() => {
      void result.current.mutate(makeFile());
    });

    await waitFor(() => expect(result.current.phase).toBe("processing"));

    await act(async () => {
      await result.current.cancel();
    });

    expect(result.current.phase).toBe("idle");
  });
});
