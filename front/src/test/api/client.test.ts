import { describe, it, expect } from "vitest";
import { teamPath } from "../../api/client";

describe("teamPath", () => {
  it("devrait construire un chemin avec un segment", () => {
    expect(teamPath("Mon equipe", "players")).toBe("/teams/Mon%20equipe/players");
  });

  it("devrait encoder le nom de l'équipe", () => {
    expect(teamPath("Équipe Spéciale", "players")).toBe(
      `/teams/${encodeURIComponent("Équipe Spéciale")}/players`,
    );
  });

  it("devrait construire un chemin avec plusieurs segments", () => {
    expect(teamPath("TeamA", "players", "5")).toBe("/teams/TeamA/players/5");
  });

  it("devrait fonctionner avec trois segments", () => {
    expect(teamPath("TeamA", "training", "algorithms")).toBe(
      "/teams/TeamA/training/algorithms",
    );
  });

  it("devrait lever une erreur si teamName est vide", () => {
    expect(teamPath("", "players")).toBe("/teams//players");
  });
});
