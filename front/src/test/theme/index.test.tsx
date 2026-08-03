import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useTheme } from "@mui/material/styles";
import { AppThemeProvider } from "../../theme";

const ThemeProbe = () => {
  const theme = useTheme();
  return <div data-testid="theme-probe">{theme.palette.primary.main}</div>;
};

describe("AppThemeProvider", () => {
  it("devrait fournir le thème aux enfants", () => {
    render(
      <AppThemeProvider>
        <ThemeProbe />
      </AppThemeProvider>,
    );

    expect(screen.getByTestId("theme-probe")).toHaveTextContent("#2D5A27");
  });

  it("devrait rendre les enfants", () => {
    render(
      <AppThemeProvider>
        <div>Contenu</div>
      </AppThemeProvider>,
    );

    expect(screen.getByText("Contenu")).toBeInTheDocument();
  });
});
