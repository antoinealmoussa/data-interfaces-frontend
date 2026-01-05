import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2D5A27", // Vert forêt profond (rassurant et naturel)
      light: "#558B4F",
      dark: "#1B3618",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#D4A373", // Terre battue / Sable (chaleureux)
      light: "#E9C46A",
      dark: "#A98467",
    },
    background: {
      default: "#EBEEE7", // Gris très légèrement teinté de vert/beige (plus doux que le blanc)
      paper: "#F8F9F5",
    },
    text: {
      primary: "#2C3333", // Anthracite doux (meilleur que le noir pur pour la lecture longue)
      secondary: "#5C6363",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, color: "#1B3618" },
    h2: { fontWeight: 600, color: "#1B3618" },
    body1: { lineHeight: 1.7 },
    fontWeightBold: 600,
    fontWeightLight: 600,
    fontWeightMedium: 600,
    fontWeightRegular: 600,
    button: {
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 8,
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
