import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SectionTable from "../../../components/race-preparation/SectionTable";
import type { ComputedSection } from "../../../types/race-preparation/raceTypes";

function makeSection(
  overrides: Partial<ComputedSection>,
): ComputedSection {
  return {
    id: 1,
    section_type: "climb",
    start_distance: 0,
    end_distance: 1000,
    distance: 1000,
    elevation_gain: 0,
    elevation_loss: 0,
    average_gradient: 0,
    start_elevation: 1000,
    end_elevation: 1000,
    pace: null,
    actual_pace: null,
    ...overrides,
  };
}

const renderTable = (sections: ComputedSection[]) => {
  const onUpdate = vi.fn();
  render(<SectionTable sections={sections} onUpdate={onUpdate} />);
  return onUpdate;
};

describe("SectionTable", () => {
  it("une descente affiche une VAM négative (dénivelé négatif / temps)", () => {
    // 1 km, 600 m de D-, allure 6 min/km -> temps 6 min = 0.1h
    // VAM = -600 / 0.1 = -6000 m/h (VAM et VAM réelle identiques)
    const descent = makeSection({
      section_type: "descent",
      distance: 1000,
      elevation_loss: 600,
      pace: 6.0,
      actual_pace: 6.0,
    });

    renderTable([descent]);

    expect(screen.getByDisplayValue("-6000")).toBeInTheDocument();
    expect(screen.getByText("-6000 m/h")).toBeInTheDocument();
  });

  it("une montée affiche une VAM positive", () => {
    // 1 km, 600 m de D+, allure 6 min/km -> temps 0.1h -> VAM = 6000 m/h
    const climb = makeSection({
      section_type: "climb",
      distance: 1000,
      elevation_gain: 600,
      pace: 6.0,
      actual_pace: 6.0,
    });

    renderTable([climb]);

    expect(screen.getByDisplayValue("6000")).toBeInTheDocument();
    expect(screen.getByText("6000 m/h")).toBeInTheDocument();
  });

  it("une aid_station affiche '-' pour la VAM", () => {
    const aid = makeSection({
      section_type: "aid_station",
      distance: 0,
      elevation_gain: 0,
      elevation_loss: 0,
      pace: 5,
      actual_pace: null,
    });

    renderTable([aid]);

    const vamCells = screen.getAllByText("-");
    expect(vamCells.length).toBeGreaterThan(0);
  });

  it("une aid_station : Vitesse figée à 0 non éditable et Vit. réelle affichée à 0", () => {
    const aid = makeSection({
      section_type: "aid_station",
      distance: 0,
      pace: 8,
      actual_pace: 9,
    });

    renderTable([aid]);

    const speedInput = screen.getByDisplayValue("0");
    expect(speedInput).toHaveProperty("disabled", true);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("une aid_station : Temps et Temps réel éditables en minutes avec suffixe min", () => {
    const aid = makeSection({
      section_type: "aid_station",
      distance: 0,
      pace: 8,
      actual_pace: 9,
    });

    renderTable([aid]);

    expect(screen.getByDisplayValue("8")).toBeInTheDocument();
    expect(screen.getByDisplayValue("9")).toBeInTheDocument();
    expect(screen.getAllByText("min").length).toBeGreaterThanOrEqual(2);
  });

  it("une aid_station : la saisie du Temps commit pace en minutes", () => {
    const onUpdate = renderTable([
      makeSection({ section_type: "aid_station", distance: 0, pace: 5 }),
    ]);

    const timeInput = screen.getByDisplayValue("5");
    fireEvent.change(timeInput, { target: { value: "12" } });
    fireEvent.keyDown(timeInput, { key: "Enter" });

    expect(onUpdate).toHaveBeenCalledWith([
      { section_id: 1, pace: 12 },
    ]);
  });

  it("une aid_station : la saisie du Temps réel commit actual_pace en minutes", () => {
    const onUpdate = renderTable([
      makeSection({
        section_type: "aid_station",
        distance: 0,
        pace: 5,
        actual_pace: 45,
      }),
    ]);

    const actualTimeInput = screen.getByDisplayValue("45");
    fireEvent.change(actualTimeInput, { target: { value: "20" } });
    fireEvent.keyDown(actualTimeInput, { key: "Enter" });

    expect(onUpdate).toHaveBeenCalledWith([
      { section_id: 1, actual_pace: 20 },
    ]);
  });

  it("une montée : la saisie du Temps réel (min) commit actual_pace en min/km", () => {
    const onUpdate = renderTable([
      makeSection({ distance: 2000, section_type: "climb", pace: 6, actual_pace: 4 }),
    ]);

    const actualTimeInput = screen.getByDisplayValue("8");
    fireEvent.change(actualTimeInput, { target: { value: "14" } });
    fireEvent.keyDown(actualTimeInput, { key: "Enter" });

    expect(onUpdate).toHaveBeenCalledWith([
      { section_id: 1, actual_pace: 7 },
    ]);
  });

  it("une montée : Vit. réelle affichée en lecture seule calculée depuis actual_pace", () => {
    renderTable([
      makeSection({ distance: 2000, section_type: "climb", pace: 6, actual_pace: 6 }),
    ]);

    expect(screen.getByText("6.0")).toBeInTheDocument();
    expect(screen.getByDisplayValue("12")).toBeInTheDocument();
  });

  it("une montée : la saisie de la VAM commit pace en min/km (VAM→pace)", () => {
    // 1 km, 600 m de D+, VAM 6000 m/h -> temps = 600*60/6000 = 6 min
    // -> pace = 6 min / 1 km = 6.0
    const onUpdate = renderTable([
      makeSection({
        distance: 1000,
        section_type: "climb",
        elevation_gain: 600,
        pace: null,
        actual_pace: null,
      }),
    ]);

    const vamInput = screen.getByPlaceholderText("m/h");
    fireEvent.change(vamInput, { target: { value: "6000" } });
    fireEvent.keyDown(vamInput, { key: "Enter" });

    expect(onUpdate).toHaveBeenCalledWith([
      { section_id: 1, pace: 6 },
    ]);
  });

  it("une descente : la saisie de la VAM négative commit un pace positif", () => {
    // 1 km, 600 m de D-, VAM -6000 m/h -> temps = (-600)*60/(-6000) = 6 min
    // -> pace = 6 min / 1 km = 6.0
    const onUpdate = renderTable([
      makeSection({
        distance: 1000,
        section_type: "descent",
        elevation_loss: 600,
        pace: null,
        actual_pace: null,
      }),
    ]);

    const vamInput = screen.getByPlaceholderText("m/h");
    fireEvent.change(vamInput, { target: { value: "-6000" } });
    fireEvent.keyDown(vamInput, { key: "Enter" });

    expect(onUpdate).toHaveBeenCalledWith([
      { section_id: 1, pace: 6 },
    ]);
  });
});
