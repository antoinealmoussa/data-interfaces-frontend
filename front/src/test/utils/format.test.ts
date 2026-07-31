import { describe, it, expect } from "vitest";
import { formatDate, formatNumber } from "../../utils/format";

describe("formatDate", () => {
  it("devrait formater une date en français", () => {
    expect(formatDate(new Date(2025, 0, 15))).toBe("15/01/2025");
  });

  it("devrait accepter une chaîne de caractères", () => {
    expect(formatDate("2025-03-07T10:00:00Z")).toBe("07/03/2025");
  });
});

describe("formatNumber", () => {
  it("devrait formater un nombre avec le séparateur français", () => {
    expect(formatNumber(1234567)).toBe("1\u202f234\u202f567");
  });

  it("devrait formater les décimales", () => {
    expect(formatNumber(1234.5)).toBe("1\u202f234,5");
  });
});
