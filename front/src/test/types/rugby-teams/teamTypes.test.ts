import { describe, it, expect } from "vitest";
import { TEAM_CATEGORIES } from "../../../types/rugby-teams/teamTypes";

describe("TEAM_CATEGORIES", () => {
  it("devrait contenir les catégories attendues", () => {
    expect(TEAM_CATEGORIES).toEqual([
      "Mixte",
      "+35",
      "+50",
      "Open féminin",
      "Open masculin",
    ]);
  });

  it("devrait permettre de typer une équipe avec ces catégories", () => {
    const team = {
      id: 1,
      name: "Équipe",
      categories: TEAM_CATEGORIES,
      user_id: 1,
      seasons: [],
    };

    expect(team.categories).toContain("Mixte");
    expect(team.categories[4]).toBe("Open masculin");
  });
});
