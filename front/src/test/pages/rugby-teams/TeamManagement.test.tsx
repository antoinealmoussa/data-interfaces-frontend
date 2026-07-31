import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TeamManagement from "../../../pages/rugby-teams/TeamManagement";
import type { Player } from "../../../types/rugby-teams/playerTypes";

const mockedUseTeamAndSeason = vi.fn();

const crudManagerMock = {
  entities: [] as Player[],
  isLoading: false,
  error: null as string | null,
  modalMode: null as "create" | "edit" | null,
  editingEntity: null as Player | null,
  deleteTarget: null as Player | null,
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

const playerFixture: Player = {
  id: 1,
  name: "Alice",
  level: 3,
  sex: "F",
  position: "Meneur",
  team_name: "Mon equipe",
  category_names: ["Mixte"],
};

const teamFixture = {
  id: 1,
  name: "Mon equipe",
  categories: ["Mixte"],
  user_id: 1,
  seasons: [{ id: 10, name: "2025-2026" }],
};

const renderPage = () => render(<TeamManagement />);

describe("TeamManagement", () => {
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
  });

  it("devrait afficher le spinner pendant le chargement", () => {
    mockedUseTeamAndSeason.mockReturnValue({
      ...mockedUseTeamAndSeason(),
      loading: true,
    });
    renderPage();

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("devrait afficher une erreur si l'équipe est introuvable", () => {
    mockedUseTeamAndSeason.mockReturnValue({
      team: null,
      season: null,
      teams: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderPage();

    expect(screen.getByText("Équipe ou saison introuvable")).toBeInTheDocument();
  });

  it("devrait afficher la liste des joueurs", () => {
    Object.assign(crudManagerMock, { entities: [playerFixture] });
    renderPage();

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Niveau 3")).toBeInTheDocument();
    expect(screen.getByText("Femme")).toBeInTheDocument();
    expect(screen.getByText("Meneur")).toBeInTheDocument();
    expect(screen.getByText("Mixte")).toBeInTheDocument();
  });

  it("devrait afficher le message vide sans joueurs", () => {
    renderPage();

    expect(
      screen.getByText("Aucun joueur dans cette équipe"),
    ).toBeInTheDocument();
  });

  it("devrait afficher une erreur de chargement des joueurs", () => {
    Object.assign(crudManagerMock, { error: "boom" });
    renderPage();

    expect(
      screen.getByText("Erreur lors du chargement des joueurs"),
    ).toBeInTheDocument();
  });

  it("devrait ouvrir la modale de création au clic sur Ajouter", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: "Ajouter un joueur" }));

    expect(crudManagerMock.setModalMode).toHaveBeenCalledWith("create");
  });

  it("devrait ouvrir la modale d'édition au clic sur Modifier", async () => {
    const user = userEvent.setup();
    Object.assign(crudManagerMock, { entities: [playerFixture] });
    renderPage();

    await user.click(screen.getByTitle("Modifier"));

    expect(crudManagerMock.setEditingEntity).toHaveBeenCalledWith(playerFixture);
    expect(crudManagerMock.setModalMode).toHaveBeenCalledWith("edit");
  });

  it("devrait ouvrir le dialogue de suppression au clic sur Supprimer", async () => {
    const user = userEvent.setup();
    Object.assign(crudManagerMock, { entities: [playerFixture] });
    renderPage();

    await user.click(screen.getByTitle("Supprimer"));

    expect(crudManagerMock.setDeleteTarget).toHaveBeenCalledWith(playerFixture);
  });

  it("devrait confirmer la suppression dans le dialogue", async () => {
    const user = userEvent.setup();
    Object.assign(crudManagerMock, { deleteTarget: playerFixture });
    renderPage();

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText("Supprimer le joueur"),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Supprimer" }));

    expect(crudManagerMock.handleDelete).toHaveBeenCalled();
  });

  it("devrait ouvrir la modale de joueur quand une édition est demandée", () => {
    Object.assign(crudManagerMock, { modalMode: "create" });
    renderPage();

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Nom")).toBeInTheDocument();
  });
});
