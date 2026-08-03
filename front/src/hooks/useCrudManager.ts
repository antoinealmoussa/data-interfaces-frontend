import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "./useSnackbar";

interface CrudManagerConfig<TEntity, TCreateDto> {
  queryKey: (string | undefined)[];
  queryFn: () => Promise<TEntity[]>;
  createFn: (data: TCreateDto) => Promise<TEntity>;
  updateFn: (id: number, data: TCreateDto) => Promise<TEntity>;
  deleteFn: (id: number) => Promise<unknown>;
  entityName: string;
  entityNamePlural?: string;
  successCreateMsg?: string;
  successUpdateMsg?: string;
  successDeleteMsg?: string;
  errorDeleteMsg?: string;
  enabled?: boolean;
}

export function useCrudManager<TEntity extends { id: number }, TCreateDto>(
  config: CrudManagerConfig<TEntity, TCreateDto>,
) {
  const queryClient = useQueryClient();
  const { snackbar, setSnackbar, showSnackbar, handleCloseSnackbar } =
    useSnackbar();
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingEntity, setEditingEntity] = useState<TEntity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TEntity | null>(null);

  const { data: entities = [], isLoading, error } = useQuery({
    queryKey: config.queryKey,
    queryFn: config.queryFn,
    enabled: config.enabled,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: config.queryKey });

  const createMutation = useMutation({
    mutationFn: config.createFn,
    onSuccess: () => {
      invalidate();
      showSnackbar(
        "success",
        config.successCreateMsg ?? `${config.entityName} ajouté avec succès`,
      );
      setModalMode(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TCreateDto) =>
      config.updateFn(editingEntity!.id, data),
    onSuccess: () => {
      invalidate();
      showSnackbar(
        "success",
        config.successUpdateMsg ?? `${config.entityName} modifié avec succès`,
      );
      setModalMode(null);
      setEditingEntity(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => config.deleteFn(deleteTarget!.id),
    onSuccess: () => {
      invalidate();
      showSnackbar(
        "success",
        config.successDeleteMsg ?? `${config.entityName} supprimé avec succès`,
      );
      setDeleteTarget(null);
    },
    onError: () => {
      showSnackbar(
        "error",
        config.errorDeleteMsg ?? `Erreur lors de la suppression`,
      );
      setDeleteTarget(null);
    },
  });

  return {
    // États
    snackbar, setSnackbar,
    modalMode, setModalMode,
    editingEntity, setEditingEntity,
    deleteTarget, setDeleteTarget,
    // Données
    entities, isLoading, error,
    // Mutations
    createMutation, updateMutation, deleteMutation,
    // Handlers prêts à l'emploi
    handleCreate: async (data: TCreateDto) => createMutation.mutate(data),
    handleUpdate: async (data: TCreateDto) => updateMutation.mutate(data),
    handleDelete: async () => deleteMutation.mutate(),
    handleCloseSnackbar,
  };
}