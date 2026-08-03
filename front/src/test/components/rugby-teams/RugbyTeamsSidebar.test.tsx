import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect } from "react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { RugbyTeamsSidebar } from "../../../components/rugby-teams/RugbyTeamsSidebar";
import type { Team } from "../../../types/rugby-teams/teamTypes";

const mockedUseTeamAndSeason = vi.fn();

vi.mock("../../../hooks/rugby-teams/useTeamAndSeason", () => ({
  useTeamAndSeason: (...args: unknown[]) => mockedUseTeamAndSeason(...args),
}));

let currentPath = "";

const LocationProbe = () => {
  const location = useLocation();
  useEffect(() => {
    currentPath = location.pathname;
  }, [location]);
  return null;
};

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
  { id: 2, name: "Autre equipe", categories: ["Open masculin"], user_id: 1, seasons: [{ id: 12, name: "2025-2026" }] },
];

const renderSidebar = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/rugby-teams/:teamName/:seasonName" element={<RugbyTeamsSidebar />} />
        <Route path="/rugby-teams" element={<RugbyTeamsSidebar />} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );

describe("RugbyTeamsSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseTeamAndSeason.mockReturnValue({
      team: teamsFixture[0],
      season: teamsFixture[0].seasons[0],
      teams: teamsFixture,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it("devrait afficher les équipes et saisons dans les listes déroulantes", () => {
    renderSidebar("/rugby-teams/Mon%20equipe/2025-2026");

    expect(screen.getAllByRole("combobox")).toHaveLength(2);
  });

  it("devrait afficher les éléments de menu quand équipe et saison sont sélectionnées", () => {
    renderSidebar("/rugby-teams/Mon%20equipe/2025-2026");

    expect(screen.getByText("Gestion d'équipe")).toBeInTheDocument();
    expect(screen.getByText("Tournoi")).toBeInTheDocument();
    expect(screen.getByText("Entraînement")).toBeInTheDocument();
  });

  it("ne devrait pas afficher les éléments de menu sans équipe et saison", () => {
    renderSidebar("/rugby-teams");

    expect(screen.queryByText("Gestion d'équipe")).not.toBeInTheDocument();
    expect(screen.queryByText("Tournoi")).not.toBeInTheDocument();
    expect(screen.queryByText("Entraînement")).not.toBeInTheDocument();
    expect(screen.getAllByRole("combobox")).toHaveLength(2);
  });

  it("devrait naviguer vers le sous-menu au clic", async () => {
    const user = userEvent.setup();
    renderSidebar("/rugby-teams/Mon%20equipe/2025-2026");

    await user.click(screen.getByText("Entraînement"));

    await waitFor(() => {
      expect(currentPath).toBe("/rugby-teams/Mon%20equipe/2025-2026/training");
    });
  });

  it("devrait naviguer lors du changement d'équipe", async () => {
    const user = userEvent.setup();
    renderSidebar("/rugby-teams/Mon%20equipe/2025-2026");

    await user.click(screen.getAllByRole("combobox")[0]);
    await user.click(await screen.findByText("Autre equipe"));

    await waitFor(() => {
      expect(currentPath).toBe(
        "/rugby-teams/Autre%20equipe/2025-2026/team-management",
      );
    });
  });

  it("devrait naviguer lors du changement de saison", async () => {
    const user = userEvent.setup();
    renderSidebar("/rugby-teams/Mon%20equipe/2025-2026");

    await user.click(screen.getAllByRole("combobox")[1]);
    await user.click(await screen.findByText("2026-2027"));

    await waitFor(() => {
      expect(currentPath).toBe(
        "/rugby-teams/Mon%20equipe/2026-2027/team-management",
      );
    });
  });
});
