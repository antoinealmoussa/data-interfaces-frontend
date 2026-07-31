import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import RugbyTeams from "../../../pages/rugby-teams/RugbyTeams";
import type { Team } from "../../../types/rugby-teams/teamTypes";

const mockedUseTeamAndSeason = vi.fn();

vi.mock("../../../hooks/rugby-teams/useTeamAndSeason", () => ({
  useTeamAndSeason: (...args: unknown[]) => mockedUseTeamAndSeason(...args),
}));

const teamsFixture: Team[] = [
  {
    id: 1,
    name: "Mon equipe",
    categories: ["Mixte"],
    user_id: 1,
    seasons: [
      { id: 10, name: "2025-2026" },
      { id: 11, name: "2026-2027" },
    ],
  },
];

let currentPath = "";

const LocationProbe = () => {
  const location = useLocation();
  useEffect(() => {
    currentPath = location.pathname;
  }, [location]);
  return null;
};

const renderPage = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/rugby-teams" element={<RugbyTeams />} />
        <Route path="/rugby-teams/team-creation" element={<RugbyTeams />} />
        <Route
          path="/rugby-teams/:teamName/:seasonName"
          element={<RugbyTeams />}
        />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );

describe("RugbyTeams", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPath = "";
    mockedUseTeamAndSeason.mockReturnValue({
      team: teamsFixture[0],
      season: teamsFixture[0].seasons[1],
      teams: teamsFixture,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it("devrait afficher le spinner pendant le chargement", () => {
    mockedUseTeamAndSeason.mockReturnValue({
      ...mockedUseTeamAndSeason(),
      loading: true,
    });
    renderPage("/rugby-teams");

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("devrait rediriger vers la création d'équipe sans équipe", async () => {
    mockedUseTeamAndSeason.mockReturnValue({
      team: null,
      season: null,
      teams: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderPage("/rugby-teams");

    await waitFor(() => {
      expect(currentPath).toBe("/rugby-teams/team-creation");
    });
  });

  it("devrait rediriger vers la première équipe et sa saison la plus récente", async () => {
    renderPage("/rugby-teams");

    await waitFor(() => {
      expect(currentPath).toBe(
        "/rugby-teams/Mon%20equipe/2026-2027/team-management",
      );
    });
  });

  it("ne devrait pas rediriger sur la page de création d'équipe", async () => {
    renderPage("/rugby-teams/team-creation");

    expect(await screen.findAllByRole("combobox")).toHaveLength(2);
    expect(currentPath).toBe("/rugby-teams/team-creation");
  });

  it("devrait afficher la barre latérale avec les équipes", async () => {
    renderPage("/rugby-teams/Mon%20equipe/2025-2026");

    expect(await screen.findByText("Gestion d'équipe")).toBeInTheDocument();
    expect(currentPath).toBe("/rugby-teams/Mon%20equipe/2025-2026");
  });
});
