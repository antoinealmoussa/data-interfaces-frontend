import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Training from "../../../pages/rugby-teams/Training";
import type { Player } from "../../../types/rugby-teams/playerTypes";

const mockedUseTeamAndSeason = vi.hoisted(() => vi.fn());
const mockedTrainingApi = vi.hoisted(() => ({
  getAlgorithms: vi.fn(),
  distribute: vi.fn(),
}));
const mockedGetByTeam = vi.hoisted(() => vi.fn());

vi.mock("../../../hooks/rugby-teams/useTeamAndSeason", () => ({
  useTeamAndSeason: (...args: unknown[]) => mockedUseTeamAndSeason(...args),
}));

vi.mock("../../../api/rugby-teams/trainingApi", () => ({
  trainingApi: mockedTrainingApi,
}));

vi.mock("../../../api/rugby-teams/playerApi", () => ({
  playerApi: { getByTeam: (...args: unknown[]) => mockedGetByTeam(...args) },
}));

const playersFixture: Player[] = [
  { id: 1, name: "Alice", level: 3, sex: "F", position: "Ailier", team_name: "Mon equipe", category_names: ["Mixte"] },
  { id: 2, name: "Bob", level: 2, sex: "H", position: "Ailier", team_name: "Mon equipe", category_names: ["Mixte"] },
  { id: 3, name: "Carlos", level: 4, sex: "H", position: "Meneur", team_name: "Mon equipe", category_names: ["Open masculin"] },
];

const teamFixture = {
  id: 1,
  name: "Mon equipe",
  categories: ["Mixte", "Open masculin"],
  user_id: 1,
  seasons: [{ id: 10, name: "2025-2026" }],
};

const renderPage = () => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <Training />
    </QueryClientProvider>,
  );
};

describe("Training", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseTeamAndSeason.mockReturnValue({
      team: teamFixture,
      season: teamFixture.seasons[0],
      teams: [teamFixture],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    mockedGetByTeam.mockResolvedValue(playersFixture);
    mockedTrainingApi.getAlgorithms.mockResolvedValue([
      { id: "balanced", label: "Équilibré" },
    ]);
    mockedTrainingApi.distribute.mockResolvedValue({
      teams: [{ id: 1, name: "Équipe A", players: [playersFixture[0], playersFixture[1]] }],
    });
  });

  it("devrait afficher le spinner pendant le chargement", () => {
    mockedUseTeamAndSeason.mockReturnValue({
      ...mockedUseTeamAndSeason(),
      loading: true,
    });
    renderPage();

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("devrait afficher les joueurs disponibles", async () => {
    renderPage();

    expect(await screen.findByLabelText("Alice")).toBeInTheDocument();
    expect(screen.getByLabelText("Bob")).toBeInTheDocument();
    expect(screen.getByLabelText("Carlos")).toBeInTheDocument();
  });

  it("devrait désactiver le bouton sans joueurs sélectionnés", async () => {
    renderPage();

    await screen.findByLabelText("Alice");
    expect(
      screen.getByRole("button", { name: "Générer les équipes" }),
    ).toBeDisabled();
  });

  it("devrait générer les équipes avec les joueurs sélectionnés et l'algorithme choisi", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByLabelText("Alice");
    await user.click(screen.getByLabelText("Alice"));
    await user.click(screen.getByLabelText("Bob"));

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Équilibré" }));

    await user.click(
      screen.getByRole("button", { name: "Générer les équipes" }),
    );

    expect(mockedTrainingApi.distribute).toHaveBeenCalledWith("Mon equipe", {
      player_ids: [1, 2],
      team_count: 2,
      algorithm: "balanced",
    });

    expect(await screen.findByText("Équipes constituées")).toBeInTheDocument();
    expect(screen.getByText("Équipe A")).toBeInTheDocument();
    expect(screen.getByText("Regénérer")).toBeInTheDocument();
  });

  it("devrait limiter le nombre d'équipes entre 1 et 6", async () => {
    renderPage();

    await screen.findByLabelText("Alice");
    const countInput = screen.getByLabelText("Nombre d'équipes");

    fireEvent.change(countInput, { target: { value: "7" } });
    expect(countInput).toHaveValue(6);

    fireEvent.change(countInput, { target: { value: "0" } });
    expect(countInput).toHaveValue(1);
  });
});
