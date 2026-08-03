import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { TeamCreationForm } from "../../../components/rugby-teams/TeamCreationForm";

const mockedTeamApi = vi.hoisted(() => ({
  create: vi.fn(),
}));

vi.mock("../../../api/rugby-teams/teamApi", () => ({
  teamApi: mockedTeamApi,
}));

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
      <MemoryRouter initialEntries={["/rugby-teams/team-creation"]}>
        <Routes>
          <Route
            path="/rugby-teams/team-creation"
            element={
              <>
                <TeamCreationForm />
                <LocationProbe />
              </>
            }
          />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("TeamCreationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPath = "/rugby-teams/team-creation";
  });

  it("devrait afficher tous les champs", () => {
    renderForm();

    expect(screen.getByLabelText("Nom de l'équipe")).toBeInTheDocument();
    expect(screen.getByLabelText("Saison (ex: 2025-2026)")).toBeInTheDocument();
    expect(screen.getByText("Catégories jouées")).toBeInTheDocument();
    expect(screen.getByText("Créer l'équipe")).toBeInTheDocument();
  });

  it("devrait afficher le compteur de caractères du nom", async () => {
    const user = userEvent.setup();
    renderForm();

    const nameInput = screen.getByLabelText("Nom de l'équipe");
    await user.type(nameInput, "ABC");

    expect(screen.getByText("3/50 caractères")).toBeInTheDocument();
  });

  it("devrait afficher les erreurs de validation à la soumission vide", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByText("Créer l'équipe"));

    expect(
      await screen.findByText("Le nom de l'équipe est obligatoire"),
    ).toBeInTheDocument();
    expect(screen.getByText("Veuillez saisir une saison.")).toBeInTheDocument();
    expect(
      screen.getByText("Veuillez sélectionner au moins une catégorie."),
    ).toBeInTheDocument();
  });

  it("devrait créer l'équipe et naviguer vers la gestion d'équipe", async () => {
    const user = userEvent.setup();
    mockedTeamApi.create.mockResolvedValue({
      id: 1,
      name: "Mon equipe",
      categories: ["Mixte"],
      user_id: 1,
      seasons: [{ id: 10, name: "2025-2026" }],
    });
    renderForm();

    await user.type(screen.getByLabelText("Nom de l'équipe"), "Mon equipe");
    await user.type(screen.getByLabelText("Saison (ex: 2025-2026)"), "2025-2026");
    await user.click(screen.getByRole("checkbox", { name: "Mixte" }));
    await user.click(screen.getByText("Créer l'équipe"));

    await waitFor(() => {
      expect(mockedTeamApi.create).toHaveBeenCalledWith({
        name: "Mon equipe",
        categories: ["Mixte"],
        season_name: "2025-2026",
      });
    });
    await waitFor(() => {
      expect(currentPath).toBe(
        "/rugby-teams/Mon%20equipe/2025-2026/team-management",
      );
    });
  });

  it("devrait afficher une erreur si la création échoue", async () => {
    const user = userEvent.setup();
    mockedTeamApi.create.mockRejectedValue(new Error("network"));
    renderForm();

    await user.type(screen.getByLabelText("Nom de l'équipe"), "Mon equipe");
    await user.type(screen.getByLabelText("Saison (ex: 2025-2026)"), "2025-2026");
    await user.click(screen.getByRole("checkbox", { name: "Mixte" }));
    await user.click(screen.getByText("Créer l'équipe"));

    expect(
      await screen.findByText("Une erreur est survenue. Veuillez réessayer."),
    ).toBeInTheDocument();
  });

  it("devrait naviguer vers l'accueil au clic sur Annuler", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByText("Annuler"));

    await waitFor(() => {
      expect(currentPath).toBe("/");
    });
  });
});
