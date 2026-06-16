import { Alert, Box } from "@mui/material";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import type { ReactNode } from "react";

interface PageGuardProps {
  loading: boolean;
  error: string | null;
  children: ReactNode;
}

export const PageGuard = ({ loading, error, children }: PageGuardProps) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <LoadingSpinner />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  return <>{children}</>;
};
