import { useCallback, useState } from "react";
import type { SnackbarState } from "../types/uiTypes";

export const useSnackbar = () => {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    severity: "success",
    message: "",
  });

  const showSnackbar = useCallback(
    (severity: SnackbarState["severity"], message: string) => {
      setSnackbar({ open: true, severity, message });
    },
    [],
  );

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  return { snackbar, setSnackbar, showSnackbar, handleCloseSnackbar };
};
