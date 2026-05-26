import { Snackbar, Alert } from "@mui/material";

interface NotificationSnackbarProps {
  open: boolean;
  severity: "success" | "error" | "warning" | "info";
  message: string;
  onClose: () => void;
  autoHideDuration?: number;
}

export const NotificationSnackbar = ({
  open,
  severity,
  message,
  onClose,
  autoHideDuration = 5000,
}: NotificationSnackbarProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};
