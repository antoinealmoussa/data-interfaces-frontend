import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useCrudManager } from "../../hooks/useCrudManager";

interface TestEntity {
  id: number;
  name: string;
}

interface TestCreateDto {
  name: string;
}

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const createMockApi = () => ({
  queryFn: vi.fn().mockResolvedValue([
    { id: 1, name: "Entité 1" },
    { id: 2, name: "Entité 2" },
  ]),
  createFn: vi.fn().mockResolvedValue({ id: 3, name: "Nouvelle" }),
  updateFn: vi.fn().mockResolvedValue({ id: 1, name: "Modifiée" }),
  deleteFn: vi.fn().mockResolvedValue(undefined),
});

describe("useCrudManager", () => {
  const mockApi = createMockApi();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait charger les entités au montage", async () => {
    const { result } = renderHook(
      () =>
        useCrudManager<TestEntity, TestCreateDto>({
          queryKey: ["test-entities"],
          queryFn: mockApi.queryFn,
          createFn: mockApi.createFn,
          updateFn: mockApi.updateFn,
          deleteFn: mockApi.deleteFn,
          entityName: "entité",
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.entities).toEqual([
      { id: 1, name: "Entité 1" },
      { id: 2, name: "Entité 2" },
    ]);
  });

  it("devrait initialiser les états vides", () => {
    const { result } = renderHook(
      () =>
        useCrudManager<TestEntity, TestCreateDto>({
          queryKey: ["test-entities"],
          queryFn: mockApi.queryFn,
          createFn: mockApi.createFn,
          updateFn: mockApi.updateFn,
          deleteFn: mockApi.deleteFn,
          entityName: "entité",
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.snackbar).toEqual({
      open: false,
      severity: "success",
      message: "",
    });
    expect(result.current.modalMode).toBeNull();
    expect(result.current.editingEntity).toBeNull();
    expect(result.current.deleteTarget).toBeNull();
  });

  it("devrait fournir les setters d'état", () => {
    const { result } = renderHook(
      () =>
        useCrudManager<TestEntity, TestCreateDto>({
          queryKey: ["test-entities"],
          queryFn: mockApi.queryFn,
          createFn: mockApi.createFn,
          updateFn: mockApi.updateFn,
          deleteFn: mockApi.deleteFn,
          entityName: "entité",
        }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.setModalMode("create");
    });
    expect(result.current.modalMode).toBe("create");

    act(() => {
      result.current.setEditingEntity({ id: 1, name: "Test" });
    });
    expect(result.current.editingEntity).toEqual({ id: 1, name: "Test" });

    act(() => {
      result.current.setDeleteTarget({ id: 2, name: "À supprimer" });
    });
    expect(result.current.deleteTarget).toEqual({ id: 2, name: "À supprimer" });
  });

  it("handleCloseSnackbar devrait fermer le snackbar", () => {
    const { result } = renderHook(
      () =>
        useCrudManager<TestEntity, TestCreateDto>({
          queryKey: ["test-entities"],
          queryFn: mockApi.queryFn,
          createFn: mockApi.createFn,
          updateFn: mockApi.updateFn,
          deleteFn: mockApi.deleteFn,
          entityName: "entité",
        }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.setSnackbar({
        open: true,
        severity: "success",
        message: "Test",
      });
    });
    expect(result.current.snackbar.open).toBe(true);

    act(() => {
      result.current.handleCloseSnackbar();
    });
    expect(result.current.snackbar.open).toBe(false);
    expect(result.current.snackbar.message).toBe("Test");
  });

  it("devrait utiliser le enabled optionnel", () => {
    const { result } = renderHook(
      () =>
        useCrudManager<TestEntity, TestCreateDto>({
          queryKey: ["test-entities"],
          queryFn: mockApi.queryFn,
          createFn: mockApi.createFn,
          updateFn: mockApi.updateFn,
          deleteFn: mockApi.deleteFn,
          entityName: "entité",
          enabled: false,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockApi.queryFn).not.toHaveBeenCalled();
  });

  it("devrait exposer les handlers create/update/delete", () => {
    const { result } = renderHook(
      () =>
        useCrudManager<TestEntity, TestCreateDto>({
          queryKey: ["test-entities"],
          queryFn: mockApi.queryFn,
          createFn: mockApi.createFn,
          updateFn: mockApi.updateFn,
          deleteFn: mockApi.deleteFn,
          entityName: "entité",
        }),
      { wrapper: createWrapper() },
    );

    expect(typeof result.current.handleCreate).toBe("function");
    expect(typeof result.current.handleUpdate).toBe("function");
    expect(typeof result.current.handleDelete).toBe("function");
  });
});
