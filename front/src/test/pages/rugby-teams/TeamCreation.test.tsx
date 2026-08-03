import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TeamCreation from "../../../pages/rugby-teams/TeamCreation";

const renderPage = (state?: { message?: string }) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter
        initialEntries={[
          { pathname: "/rugby-teams/team-creation", state: state ?? null },
        ]}
      >
        <TeamCreation />
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("TeamCreation", () => {
  it("devrait afficher le formulaire de création d'équipe", () => {
    renderPage();

    expect(screen.getByLabelText("Nom de l'équipe")).toBeInTheDocument();
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
