import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SectionSplitter from "../../../components/race-preparation/SectionSplitter";
import type { TrackPoint, Section } from "../../../types/race-preparation/raceTypes";

vi.mock("../../../components/race-preparation/ElevationProfile", () => ({
  default: () => <div data-testid="elevation-profile" />,
}));

vi.mock("../../../components/race-preparation/TrailMap", () => ({
  default: () => <div data-testid="trail-map" />,
}));

const trackPoints: TrackPoint[] = [
  { lat: 45.0, lon: 6.0, elevation: 1000, distance: 0 },
  { lat: 45.1, lon: 6.1, elevation: 2000, distance: 1000 },
];

const emptySections: Section[] = [];

const sections: Section[] = [
  {
    id: 1,
    race_id: 42,
    order_index: 0,
    name: "Première montée",
    section_type: "climb",
    start_distance: 0,
    end_distance: 500,
    distance: 500,
    elevation_gain: 300,
    elevation_loss: 0,
    average_gradient: 10,
    start_elevation: 1000,
    end_elevation: 1300,
    pace: null,
    actual_pace: null,
  },
  {
    id: 2,
    race_id: 42,
    order_index: 1,
    name: null,
    section_type: "aid_station",
    start_distance: 500,
    end_distance: 500,
    distance: 0,
    elevation_gain: 0,
    elevation_loss: 0,
    average_gradient: 0,
    start_elevation: 1300,
    end_elevation: 1300,
    pace: 5,
    actual_pace: null,
  },
];

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderSplitter = (sectionsArg: Section[]) =>
  render(
    <QueryClientProvider client={queryClient}>
      <SectionSplitter
        raceId={42}
        trackPoints={trackPoints}
        sections={sectionsArg}
      />
    </QueryClientProvider>,
  );

describe("SectionSplitter", () => {
  it("avec des sections : affiche le profil/carte et le tableau en même temps", () => {
    renderSplitter(sections);

    expect(screen.getByTestId("elevation-profile")).toBeInTheDocument();
    expect(screen.getByTestId("trail-map")).toBeInTheDocument();
    expect(screen.getByText("Montée")).toBeInTheDocument();
    expect(screen.getAllByText("Ravitaillement").length).toBeGreaterThan(0);
    expect(screen.queryByText("Profil / Carte")).not.toBeInTheDocument();
    expect(screen.queryByText("Tableau")).not.toBeInTheDocument();
  });

  it("sans sections : affiche le profil et la carte, pas de tableau", () => {
    renderSplitter(emptySections);

    expect(screen.getByTestId("elevation-profile")).toBeInTheDocument();
    expect(screen.getByTestId("trail-map")).toBeInTheDocument();
    expect(screen.queryByText("Montée")).not.toBeInTheDocument();
    expect(screen.queryByText("Profil / Carte")).not.toBeInTheDocument();
    expect(screen.queryByText("Tableau")).not.toBeInTheDocument();
  });

  it("sur Entrée dans une allure, déplace le focus vers le champ VAM de la même ligne", () => {
    renderSplitter(sections);

    const firstPace = screen.getByPlaceholderText("9.0");
    firstPace.focus();
    fireEvent.keyDown(firstPace, { key: "Enter" });

    expect(document.activeElement).toBe(screen.getByPlaceholderText("m/h"));
  });

  it("sur Entrée dans une VAM, déplace le focus vers le champ Temps de la ligne ravitaillement suivante", () => {
    renderSplitter(sections);

    const firstVam = screen.getByPlaceholderText("m/h");
    firstVam.focus();
    fireEvent.keyDown(firstVam, { key: "Enter" });

    expect(document.activeElement).toBe(screen.getByDisplayValue("5"));
  });
});
