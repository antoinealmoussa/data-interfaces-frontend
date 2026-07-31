import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TournamentManagement from "../../../pages/rugby-teams/TournamentManagement";
import type { Tournament } from "../../../types/rugby-teams/tournamentTypes";

const mockedUseTeamAndSeason = vi.fn();

const crudManagerMock = {
  entities: [] as Tournament[],
  isLoading: false,
  error: null as string | null,
  modalMode: null as "create" | "edit" | null,
  editingEntity: null as Tournament | null,
  deleteTarget: null as Tournament | null,
  snackbar: { open: false, severity: "success", message: "" },
  handleCreate: vi.fn(),
  handleUpdate: vi.fn(),
  handleDelete: vi.fn(),
  handleCloseSnackbar: vi.fn(),
  deleteMutation: { isPending: false },
  setEditingEntity: vi.fn(),
  setModalMode: vi.fn(),
  setDeleteTarget: vi.fn(),
};

vi.mock("../../../hooks/rugby-teams/useTeamAndSeason", () => ({
  useTeamAndSeason: (...args: unknown[]) => mockedUseTeamAndSeason(...args),
}));

vi.mock("../../../hooks/useCrudManager", () => ({
  useCrudManager: () => crudManagerMock,
}));

const mockedGetByTeam = vi.fn();

vi.mock("../../../api/rugby-teams/playerApi", () => ({
  playerApi: { getByTeam: (...args: unknown[]) => mockedGetByTeam(...args) },
}));

vi.mock("../../../api/rugby-teams/tournamentApi", () => ({
  tournamentApi: {
    getByTeam: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const teamFixture = {
  id: 1,
  name: "Mon equipe",
  categories: ["Mixte", "Open masculin"],
  user_id: 1,
  seasons: [{ id: 10, name: "2025-2026" }],
};

const tournamentFixture: Tournament = {
  id: 2,
  name: "Tournoi A",
  category_name: "Mixte",
  player_names: ["Alice", "Bob"],
};

const renderPage = () => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <TournamentManagement />
    </QueryClientProvider>,
  );
};

describe("TournamentManagement", () => {
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
    Object.assign(crudManagerMock, {
      entities: [],
      isLoading: false,
      error: null,
      modalMode: null,
      editingEntity: null,
      deleteTarget: null,
      snackbar: { open: false, severity: "success", message: "" },
    });
    mockedGetByTeam.mockResolvedValue([
      { id: 1, name: "Alice", level: 3, sex: "F", position: "Centre", category_names: ["Mixte"] },
      { id: 2, name: "Bob", level: 2, sex: "H", position: "Ailier", category_names: ["Mixte"] },
    ]);
  });

  it("devrait afficher les statistiques des joueurs par défaut", async () => {
    Object.assign(crudManagerMock, { entities: [tournamentFixture] });
    renderPage();

    expect(await screen.findByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Open masculin")).toBeInTheDocument();
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
  });

  it("devrait afficher le message vide sans joueurs", async () => {
    mockedGetByTeam.mockResolvedValue([]);
    renderPage();

    expect(
      await screen.findByText("Aucun joueur dans cette équipe"),
    ).toBeInTheDocument();
  });

  it("devrait basculer vers la vue tournois", async () => {
    const user = userEvent.setup();
    Object.assign(crudManagerMock, { entities: [tournamentFixture] });
    renderPage();

    await screen.findByText("Alice");
    await user.click(screen.getByText("Tournois"));

    expect(await screen.findByText("Tournoi A")).toBeInTheDocument();
    expect(screen.getByText("Catégorie")).toBeInTheDocument();
    expect(screen.getByText("Alice, Bob")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ajouter un tournoi" }),
    ).toBeInTheDocument();
  });

  it("devrait ouvrir la modale de création de tournoi", async () => {
    const user = userEvent.setup();
    mockedGetByTeam.mockResolvedValue([]);
    renderPage();

    await screen.findByText("Aucun joueur dans cette équipe");
    await user.click(screen.getByText("Tournois"));
    await user.click(
      screen.getByRole("button", { name: "Ajouter un tournoi" }),
    );

    expect(crudManagerMock.setModalMode).toHaveBeenCalledWith("create");
  });

  it("devrait supprimer un tournoi après confirmation", async () => {
    const user = userEvent.setup();
    Object.assign(crudManagerMock, {
      entities: [tournamentFixture],
      deleteTarget: tournamentFixture,
    });
    renderPage();

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText("Supprimer le tournoi"),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Supprimer" }));

    expect(crudManagerMock.handleDelete).toHaveBeenCalled();
  });
});
