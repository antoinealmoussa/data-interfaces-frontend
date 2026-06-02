import { useState, useMemo, useEffect, type ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  CircularProgress,
  Alert,
  Box,
  Typography,
  TextField,
  TablePagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
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
  /** When provided, the default search field is hidden and the parent controls rendering */
  search?: string;
  onSearchChange?: (value: string) => void;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const aVal = a[orderBy];
  const bVal = b[orderBy];
  if (bVal < aVal) return -1;
  if (bVal > aVal) return 1;
  return 0;
}

function getComparator<T>(
  order: "asc" | "desc",
  orderBy: keyof T,
): (a: T, b: T) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const ROWS_PER_PAGE = 10;

function matchesSearch<T>(row: T, columns: Column<T>[], search: string): boolean {
  if (!search) return true;
  const lower = search.toLowerCase();
  return columns.some((col) => {
    const value = row[col.key as keyof T];
    return String(value ?? "").toLowerCase().includes(lower);
  });
}

export const GenericDataTable = <T,>({
  columns,
  rows,
  actions,
  loading = false,
  emptyMessage = "Aucune donnée",
  error = null,
  getRowId,
  search: controlledSearch,
  onSearchChange,
}: GenericDataTableProps<T>) => {
  const isControlled = controlledSearch !== undefined;
  const [internalSearch, setInternalSearch] = useState("");
  const search = isControlled ? controlledSearch : internalSearch;
  const setSearch = (value: string) => {
    if (onSearchChange) onSearchChange(value);
    if (!isControlled) setInternalSearch(value);
  };

  const [orderBy, setOrderBy] = useState<keyof T | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const handleSort = (key: keyof T) => {
    if (orderBy === key) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setOrderBy(key);
      setOrder("asc");
    }
  };

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesSearch(row, columns, search)),
    [rows, columns, search],
  );

  const sortedRows = useMemo(
    () =>
      orderBy
        ? [...filteredRows].sort(getComparator(order, orderBy))
        : filteredRows,
    [filteredRows, order, orderBy],
  );

  const pageRows = sortedRows.slice(
    page * ROWS_PER_PAGE,
    (page + 1) * ROWS_PER_PAGE,
  );

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
    <Box>
      {!isControlled && (
        <TextField
          size="small"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
            },
          }}
          sx={{ mb: 2, maxWidth: 320 }}
        />
      )}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => {
                const isSortable = col.sortable !== false;
                return (
                  <TableCell key={String(col.key)}>
                    {isSortable ? (
                      <TableSortLabel
                        active={orderBy === col.key}
                        direction={orderBy === col.key ? order : "asc"}
                        onClick={() => handleSort(col.key as keyof T)}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : (
                      col.label
                    )}
                  </TableCell>
                );
              })}
              {actions && actions.length > 0 && (
                <TableCell align="right">Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} align="center">
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row) => (
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
      <TablePagination
        component="div"
        count={sortedRows.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={ROWS_PER_PAGE}
        rowsPerPageOptions={[ROWS_PER_PAGE]}
        labelRowsPerPage=""
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
      />
    </Box>
  );
};
