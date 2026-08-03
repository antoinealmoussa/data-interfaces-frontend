import { useEffect } from "react";
import { Box, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { ReactNode } from "react";
import { GenericDataTable, type Column } from "./GenericDataTable";
import { ConfirmDialog } from "./ConfirmDialog";
import { NotificationSnackbar } from "./NotificationSnackbar";
import { useCrudManager } from "../../hooks/useCrudManager";
import type { Action } from "./GenericDataTable";

interface FormRenderProps<TEntity, TCreateDto> {
  open: boolean;
  mode: "create" | "edit";
  entity: TEntity | null;
  onSave: (data: TCreateDto) => Promise<void>;
  onClose: () => void;
}

interface EntityCrudPageProps<TEntity extends { id: number; name: string }, TCreateDto> {
  queryKey: (string | undefined)[];
  queryFn: () => Promise<TEntity[]>;
  createFn: (data: TCreateDto) => Promise<TEntity>;
  updateFn: (id: number, data: TCreateDto) => Promise<TEntity>;
  deleteFn: (id: number) => Promise<unknown>;
  entityName: string;
  enabled?: boolean;
  columns: Column<TEntity>[];
  addButtonLabel: string;
  addButtonIcon?: ReactNode;
  emptyMessage: string;
  loadingErrorMsg: string;
  renderForm: (props: FormRenderProps<TEntity, TCreateDto>) => ReactNode;
  showContent?: boolean;
  onEntitiesChange?: (entities: TEntity[]) => void;
  successCreateMsg?: string;
  successUpdateMsg?: string;
  successDeleteMsg?: string;
  errorDeleteMsg?: string;
}

export const EntityCrudPage = <TEntity extends { id: number; name: string }, TCreateDto>({
  queryKey,
  queryFn,
  createFn,
  updateFn,
  deleteFn,
  entityName,
  enabled,
  columns,
  addButtonLabel,
  addButtonIcon,
  emptyMessage,
  loadingErrorMsg,
  renderForm,
  showContent = true,
  onEntitiesChange,
  successCreateMsg,
  successUpdateMsg,
  successDeleteMsg,
  errorDeleteMsg,
}: EntityCrudPageProps<TEntity, TCreateDto>) => {
  const manager = useCrudManager<TEntity, TCreateDto>({
    queryKey,
    queryFn,
    createFn,
    updateFn,
    deleteFn,
    entityName,
    enabled,
    successCreateMsg,
    successUpdateMsg,
    successDeleteMsg,
    errorDeleteMsg,
  });

  useEffect(() => {
    onEntitiesChange?.(manager.entities);
  }, [manager.entities, onEntitiesChange]);

  const actions: Action<TEntity>[] = [
    {
      label: "Modifier",
      icon: <EditIcon />,
      onClick: (entity) => {
        manager.setEditingEntity(entity);
        manager.setModalMode("edit");
      },
    },
    {
      label: "Supprimer",
      icon: <DeleteIcon />,
      color: "error",
      onClick: (entity) => manager.setDeleteTarget(entity),
    },
  ];

  return (
    <Box>
      {showContent && (
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Button
              variant="contained"
              startIcon={addButtonIcon}
              onClick={() => manager.setModalMode("create")}
            >
              {addButtonLabel}
            </Button>
          </Box>

          <GenericDataTable
            columns={columns}
            rows={manager.entities}
            actions={actions}
            loading={manager.isLoading}
            error={manager.error ? loadingErrorMsg : null}
            emptyMessage={emptyMessage}
            getRowId={(entity) => entity.id}
          />
        </>
      )}

      {renderForm({
        open: manager.modalMode !== null,
        mode: manager.modalMode ?? "create",
        entity: manager.editingEntity,
        onSave:
          manager.modalMode === "create"
            ? manager.handleCreate
            : manager.handleUpdate,
        onClose: () => {
          manager.setModalMode(null);
          manager.setEditingEntity(null);
        },
      })}

      <ConfirmDialog
        open={manager.deleteTarget !== null}
        title={`Supprimer le ${entityName}`}
        message={
          manager.deleteTarget
            ? `Êtes-vous sûr de vouloir supprimer ${manager.deleteTarget.name} ? Cette action est irréversible.`
            : ""
        }
        confirmLabel="Supprimer"
        confirmColor="error"
        loading={manager.deleteMutation.isPending}
        onConfirm={manager.handleDelete}
        onCancel={() => manager.setDeleteTarget(null)}
      />

      <NotificationSnackbar
        open={manager.snackbar.open}
        severity={manager.snackbar.severity}
        message={manager.snackbar.message}
        onClose={manager.handleCloseSnackbar}
      />
    </Box>
  );
};
