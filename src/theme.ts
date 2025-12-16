import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Bleu par défaut
    },
    secondary: {
      main: "#dc004e", // Rose
    },
  },
  typography: {
    fontFamily: "sans-serif",
  },
});

export default theme;
