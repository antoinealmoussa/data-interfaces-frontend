import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RacePreparation from "../../../pages/race-preparation/RacePreparation";

describe("RacePreparation", () => {
  it("devrait afficher le contenu de la page", () => {
    render(<RacePreparation />);

    expect(screen.getByText("Race preparation")).toBeInTheDocument();
  });
});
