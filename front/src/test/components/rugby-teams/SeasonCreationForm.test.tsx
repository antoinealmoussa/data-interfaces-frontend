import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { SeasonCreationForm } from "../../../components/rugby-teams/SeasonCreationForm";
import type { Player } from "../../../types/rugby-teams/playerTypes";

const mockedUseTeamAndSeason = vi.hoisted(() => vi.fn());
const mockedGetByTeam = vi.hoisted(() => vi.fn());
const mockedSeasonApi = vi.hoisted(() => ({
  createForTeam: vi.fn(),
}));

vi.mock("../../../hooks/rugby-teams/useTeamAndSeason", () => ({
  useTeamAndSeason: (...args: unknown[]) => mockedUseTeamAndSeason(...args),
}));

vi.mock("../../../api/rugby-teams/playerApi", () => ({
  playerApi: { getByTeam: (...args: unknown[]) => mockedGetByTeam(...args) },
}));

vi.mock("../../../api/rugby-teams/seasonApi", () => ({
  seasonApi: mockedSeasonApi,
}));

const playersFixture: Player[] = [
  { id: 1, name: "Alice", level: 3, sex: "F", position: "Ailier", category_names: ["Mixte"] },
  { id: 2, name: "Bob", level: 2, sex: "H", position: "Ailier", category_names: ["Mixte"] },
];

const teamFixture = {
  id: 1,
  name: "Mon equipe",
  categories: ["Mixte"],
  user_id: 1,
  seasons: [{ id: 10, name: "2025-2026" }, { id: 11, name: "2026-2027" }],
};

let currentPath = "/";

const LocationProbe = () => {
  const location = useLocation();
  useEffect(() => {
    currentPath = location.pathname;
  }, [location]);
  return null;
};

const renderForm = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={["/rugby-teams/Mon%20equipe/2025-2026/new-season"]}>
        <Routes>
          <Route
            path="/rugby-teams/:teamName/:seasonName/new-season"
            element={
              <>
                <SeasonCreationForm />
                <LocationProbe />
              </>
            }
          />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("SeasonCreationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPath = "/rugby-teams/Mon%20equipe/2025-2026/new-season";
    mockedUseTeamAndSeason.mockReturnValue({
      team: teamFixture,
      season: teamFixture.seasons[0],
      teams: [teamFixture],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    mockedGetByTeam.mockResolvedValue(playersFixture);
  });

  it("devrait pré-remplir le nom de la saison suivante", async () => {
    renderForm();

    const nameInput = await screen.findByLabelText("Nom de la saison (AAAA-AAAA)");
    await waitFor(() => {
      expect(nameInput).toHaveValue("2026-2027");
    });
  });

  it("devrait pré-sélectionner tous les joueurs", async () => {
    renderForm();

    await screen.findByLabelText("Alice");
    expect(screen.getByLabelText("Alice")).toBeChecked();
    expect(screen.getByLabelText("Bob")).toBeChecked();
    expect(screen.getByText("Joueurs à conserver (2/2)")).toBeInTheDocument();
  });

  it("devrait afficher une erreur de format de saison invalide", async () => {
    const user = userEvent.setup();
    renderForm();

    const nameInput = await screen.findByLabelText("Nom de la saison (AAAA-AAAA)");
    await waitFor(() => expect(nameInput).toHaveValue("2026-2027"));
    await user.clear(nameInput);
    await user.type(nameInput, "2026");
    await user.click(screen.getByText("Créer la saison"));

    expect(
      await screen.findByText(
        "Format invalide, utilisez AAAA-AAAA (ex : 2026-2027)",
      ),
    ).toBeInTheDocument();
  });

  it("devrait créer la saison et naviguer vers la gestion d'équipe", async () => {
    const user = userEvent.setup();
    mockedSeasonApi.createForTeam.mockResolvedValue({
      id: 1,
      name: "Mon equipe",
      categories: ["Mixte"],
      user_id: 1,
      seasons: [{ id: 10, name: "2025-2026" }, { id: 11, name: "2026-2027" }],
    });
    renderForm();

    const nameInput = await screen.findByLabelText("Nom de la saison (AAAA-AAAA)");
    await waitFor(() => expect(nameInput).toHaveValue("2026-2027"));

    await user.click(screen.getByLabelText("Bob"));
    await user.click(screen.getByText("Créer la saison"));

    await waitFor(() => {
      expect(mockedSeasonApi.createForTeam).toHaveBeenCalledWith("Mon equipe", {
        name: "2026-2027",
        player_ids: [1],
      });
    });
    await waitFor(() => {
      expect(currentPath).toBe(
        "/rugby-teams/Mon%20equipe/2026-2027/team-management",
      );
    });
  });

  it("devrait afficher une erreur si la création échoue", async () => {
    const user = userEvent.setup();
    mockedSeasonApi.createForTeam.mockRejectedValue(new Error("network"));
    renderForm();

    const nameInput = await screen.findByLabelText("Nom de la saison (AAAA-AAAA)");
    await waitFor(() => expect(nameInput).toHaveValue("2026-2027"));
    await user.click(screen.getByText("Créer la saison"));

    expect(
      await screen.findByText("Une erreur est survenue. Veuillez réessayer."),
    ).toBeInTheDocument();
  });
});