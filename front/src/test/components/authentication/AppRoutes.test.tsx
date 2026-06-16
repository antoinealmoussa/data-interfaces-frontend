import { describe, it, expect, vi, beforeEach } from "vitest";

const mockedClient = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("../../../api/client", () => ({
  default: mockedClient,
}));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../components/authentication/AppRoutes";
import { AuthProvider } from "../../../contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderWithProviders = (initialEntries: string[]) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("AppRoutes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedClient.get.mockRejectedValue(new Error("No auth"));
  });

  it("devrait afficher la page de login pour /login", async () => {
    renderWithProviders(["/login"]);

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });

  it("devrait afficher la page d'inscription pour /register", async () => {
    renderWithProviders(["/register"]);

    await waitFor(() => {
      expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    });
  });

  it("devrait afficher la page d'accueil pour / quand authentifié", async () => {
    mockedClient.get.mockResolvedValue({
      data: {
        user: {
          id: 1,
          email: "test@test.com",
          first_name: "Jean",
          surname: "Dupont",
        },
        applications: [],
      },
    });

    renderWithProviders(["/"]);

    await waitFor(() => {
      expect(screen.getByText(/Bonjour Jean/)).toBeInTheDocument();
    });
  });

  it("devrait afficher les routes dynamiques pour les applications de l'utilisateur", async () => {
    mockedClient.get.mockResolvedValue({
      data: {
        user: {
          id: 1,
          email: "test@test.com",
          first_name: "Jean",
          surname: "Dupont",
        },
        applications: [{ name: "rugby-teams", pretty_name: "Rugby Teams" }],
      },
    });

    renderWithProviders(["/rugby-teams"]);

    await waitFor(() => {
      expect(screen.getByText(/Chargement\.\.\./i)).toBeInTheDocument();
    });
  });

  it("ne devrait pas afficher les routes dynamiques sans applications", async () => {
    mockedClient.get.mockResolvedValue({
      data: {
        user: {
          id: 1,
          email: "test@test.com",
          first_name: "Jean",
          surname: "Dupont",
        },
        applications: [],
      },
    });

    renderWithProviders(["/rugby-teams"]);

    await waitFor(() => {
      expect(screen.queryByText(/Chargement\.\.\./i)).not.toBeInTheDocument();
    });
  });
});
