import { describe, it, expect } from "vitest";
import { toggleArrayItem } from "../../utils/array";

describe("toggleArrayItem", () => {
  it("devrait ajouter un élément s'il n'est pas présent", () => {
    expect(toggleArrayItem([1, 2, 3], 4)).toEqual([1, 2, 3, 4]);
  });

  it("devrait supprimer un élément s'il est présent", () => {
    expect(toggleArrayItem([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it("devrait fonctionner avec des chaînes de caractères", () => {
    expect(toggleArrayItem(["a", "b"], "c")).toEqual(["a", "b", "c"]);
    expect(toggleArrayItem(["a", "b", "c"], "b")).toEqual(["a", "c"]);
  });

  it("devrait retourner un nouveau tableau sans muter l'original", () => {
    const original = [1, 2, 3];
    const result = toggleArrayItem(original, 2);
    expect(result).toEqual([1, 3]);
    expect(original).toEqual([1, 2, 3]);
  });

  it("devrait gérer un tableau vide", () => {
    expect(toggleArrayItem([], 1)).toEqual([1]);
  });
});
