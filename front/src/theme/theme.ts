import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3b82f6", // Bleu Tailwind (blue-500)
    },
    secondary: {
      main: "#10b981", // Vert Tailwind (emerald-500)
    },
    background: {
      default: "#f3f4f6", // Gris clair Tailwind (gray-100)
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          boxSizing: "border-box",
        },
        "*, *::before, *::after": {
          boxSizing: "inherit", // Hérite du border-box défini dans html
        },
        body: {
          margin: 0, // Optionnel : retire les marges par défaut du navigateur
        },
      },
    },
  },
});

export default theme;
