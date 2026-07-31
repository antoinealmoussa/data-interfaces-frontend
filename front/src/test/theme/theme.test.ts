import { describe, it, expect } from "vitest";
import theme from "../../theme/theme";

describe("theme", () => {
  it("devrait définir la palette primaire verte", () => {
    expect(theme.palette.primary.main).toBe("#2D5A27");
    expect(theme.palette.primary.contrastText).toBe("#ffffff");
  });

  it("devrait définir la palette secondaire sable", () => {
    expect(theme.palette.secondary.main).toBe("#D4A373");
  });

  it("devrait définir les couleurs d'arrière-plan", () => {
    expect(theme.palette.background.default).toBe("#EBEEE7");
    expect(theme.palette.background.paper).toBe("#CACDC3");
  });

  it("devrait configurer la typographie", () => {
    expect(theme.typography.fontFamily).toContain("Roboto");
    expect(theme.typography.button?.textTransform).toBe("none");
  });

  it("devrait arrondir les angles des composants", () => {
    expect(theme.shape.borderRadius).toBe(8);
  });
});
