import { ThemeProvider, CssBaseline } from "@mui/material";
import type { ReactNode } from "react";
import theme from "./theme";

export const AppThemeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
