import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TeamCreation from "../../../pages/rugby-teams/TeamCreation";

const mockedUseAuth = vi.fn();

vi.mock("../../../hooks/useAuth", () => ({
  useAuth: (...args: unknown[]) => mockedUseAuth(...args),
}));

const renderPage = (state?: { message?: string }) =>
  render(
    <MemoryRouter
      initialEntries={[
        { pathname: "/rugby-teams/team-creation", state: state ?? null },
      ]}
    >
      <TeamCreation />
    </MemoryRouter>,
  );

describe("TeamCreation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({ user: { id: 42 } });
  });

  it("devrait afficher le formulaire quand un utilisateur est connecté", () => {
    renderPage();

    expect(screen.getByLabelText("Nom de l'équipe")).toBeInTheDocument();
  });

  it("ne devrait pas afficher le formulaire sans utilisateur", () => {
    mockedUseAuth.mockReturnValue({ user: null });
    renderPage();

    expect(screen.queryByLabelText("Nom de l'équipe")).not.toBeInTheDocument();
  });

  it("devrait afficher le message de succès passé via la navigation", () => {
    renderPage({ message: "Équipe créée avec succès" });

    expect(screen.getByText("Équipe créée avec succès")).toBeInTheDocument();
  });

  it("ne devrait pas afficher d'alerte sans message", () => {
    renderPage();

    expect(
      screen.queryByRole("alert"),
    ).not.toBeInTheDocument();
  });
});
