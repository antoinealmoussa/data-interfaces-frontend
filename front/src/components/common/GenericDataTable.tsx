import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  Box,
  Typography,
} from "@mui/material";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row: T) => ReactNode;
}

export interface Action<T> {
  label: string;
  icon?: ReactNode;
  color?: "primary" | "error" | "secondary" | "inherit";
  onClick: (row: T) => void;
}

interface GenericDataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  actions?: Action<T>[];
  loading?: boolean;
  emptyMessage?: string;
  error?: string | null;
  getRowId: (row: T) => string | number;
}

export const GenericDataTable = <T,>({
  columns,
  rows,
  actions,
  loading = false,
  emptyMessage = "Aucune donnée",
  error = null,
  getRowId,
}: GenericDataTableProps<T>) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const colSpan = columns.length + (actions && actions.length > 0 ? 1 : 0);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={String(col.key)}>{col.label}</TableCell>
            ))}
            {actions && actions.length > 0 && (
              <TableCell align="right">Actions</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} align="center">
                <Typography color="text.secondary">{emptyMessage}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={getRowId(row)}>
                {columns.map((col) => (
                  <TableCell key={String(col.key)}>
                    {col.render
                      ? col.render(row[col.key as keyof T], row)
                      : String(row[col.key as keyof T] ?? "")}
                  </TableCell>
                ))}
                {actions && actions.length > 0 && (
                  <TableCell align="right">
                    {actions.map((action) => (
                      <IconButton
                        key={action.label}
                        color={action.color ?? "primary"}
                        size="small"
                        onClick={() => action.onClick(row)}
                        title={action.label}
                      >
                        {action.icon}
                      </IconButton>
                    ))}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
