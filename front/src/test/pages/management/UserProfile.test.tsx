import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UserProfile from "../../../pages/management/UserProfile";
import { AuthContext } from "../../../contexts/AuthContextDefinition";
import type { AuthContextType, User } from "../../../types/authTypes";
import axios from "axios";
const mockedAxios = vi.mocked(axios, true);

vi.mock("../../../api/config", () => ({
  default: {
    backend: "http://localhost:8000/api/v1",
  },
}));

const mockUser = {
  id: 1,
  email: "test@example.com",
  first_name: "John",
  surname: "Doe",
  role: "normal_user",
};

const mockUserResponse = { user: mockUser };

const renderProfile = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <UserProfile />
    </QueryClientProvider>,
  );
};

const renderAdminProfile = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const adminUser: User = {
    id: 1,
    email: "admin@example.com",
    first_name: "Admin",
    surname: "Root",
    role: "admin",
  };
  const authContext: AuthContextType = {
    isAuthenticated: true,
    isLoading: false,
    user: adminUser,
    applications: [],
    login: async () => {},
    logout: async () => {},
    hasRole: (...roles) => roles.includes(adminUser.role),
    isAdmin: true,
  };
  return render(
    <AuthContext.Provider value={authContext}>
      <QueryClientProvider client={queryClient}>
        <UserProfile />
      </QueryClientProvider>
    </AuthContext.Provider>,
  );
};

describe("UserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait afficher un chargement pendant le chargement des données", () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => {}));

    renderProfile();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("devrait afficher le titre Mon profil", async () => {
    mockedAxios.get.mockResolvedValue({
      data: mockUserResponse,
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText("Mon profil")).toBeInTheDocument();
    });
  });

  it("devrait afficher le formulaire avec les données utilisateur", async () => {
    mockedAxios.get.mockResolvedValue({
      data: mockUserResponse,
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/prénom/i)).toHaveValue("John");
    expect(screen.getByLabelText(/nom de famille/i)).toHaveValue("Doe");
    expect(screen.getByLabelText(/email/i)).toHaveValue("test@example.com");
  });

  it("devrait afficher un message de succès après une mise à jour réussie", async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValue({
      data: mockUserResponse,
    });
    mockedAxios.put.mockResolvedValue({
      data: { ...mockUser, first_name: "Jane" },
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    });

    const firstNameInput = screen.getByLabelText(/prénom/i);
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Jane");

    const submitButton = screen.getByRole("button", { name: /enregistrer/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/profil mis à jour avec succès/i),
      ).toBeInTheDocument();
    });
  });

  it("devrait afficher un message d'erreur si la mise à jour échoue", async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValue({
      data: mockUserResponse,
    });
    mockedAxios.put.mockRejectedValue(new Error("Network Error"));

    renderProfile();

    await waitFor(() => {
      expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    });

    const firstNameInput = screen.getByLabelText(/prénom/i);
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Jane");

    const submitButton = screen.getByRole("button", { name: /enregistrer/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/erreur lors de la mise à jour/i),
      ).toBeInTheDocument();
    });
  });

  it("ne devrait pas afficher la section demandes d'accès pour un utilisateur normal", async () => {
    mockedAxios.get.mockResolvedValue({
      data: mockUserResponse,
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText("Mon profil")).toBeInTheDocument();
    });

    expect(
      screen.queryByText("Demandes d'accès"),
    ).not.toBeInTheDocument();
  });

  it("devrait afficher la section demandes d'accès pour un admin", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/applications")) {
        return Promise.resolve({
          data: [
            { name: "rugby-teams", pretty_name: "Rugby Teams", description: "Gestion d'équipes de rugby" },
          ],
        });
      }
      if (url.includes("/application-access-requests")) {
        return Promise.resolve({
          data: [
            {
              id: 1,
              status: "pending",
              created_at: "2026-01-01T00:00:00",
              user: {
                id: 2,
                email: "john.doe@example.com",
                first_name: "John",
                surname: "Doe",
              },
              applications: [
                { name: "rugby-teams", pretty_name: "Rugby Teams", description: "Gestion d'équipes de rugby" },
              ],
            },
          ],
        });
      }
      return Promise.resolve({ data: mockUserResponse });
    });

    renderAdminProfile();

    await waitFor(() => {
      expect(screen.getByText("Demandes d'accès")).toBeInTheDocument();
    });

    expect(screen.getByText(/John Doe — john.doe@example.com/)).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: /rugby teams/i }),
    ).toBeChecked();
  });

  it("ne devrait pas envoyer de requête si aucune modification n'a été faite", async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValue({
      data: mockUserResponse,
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /enregistrer/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/aucune modification détectée/i),
      ).toBeInTheDocument();
    });
    expect(mockedAxios.put).not.toHaveBeenCalled();
  });

  it("devrait afficher un message d'erreur si le chargement échoue", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));

    renderProfile();

    await waitFor(() => {
      expect(
        screen.getByText(/erreur lors du chargement du profil/i),
      ).toBeInTheDocument();
    });
  });

  it("devrait désactiver le bouton pendant la soumission", async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValue({
      data: mockUserResponse,
    });
    mockedAxios.put.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ data: { ...mockUser, first_name: "Jane" } }), 200)),
    );

    renderProfile();

    await waitFor(() => {
      expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    });

    const firstNameInput = screen.getByLabelText(/prénom/i);
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Jane");

    const submitButton = screen.getByRole("button", { name: /enregistrer/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /enregistrement\.\.\./i }),
      ).toBeDisabled();
    });
  });

  it("devrait fermer le snackbar quand on clique sur le bouton de fermeture", async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValue({
      data: mockUserResponse,
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    });

    const submitButton = screen.getByRole("button", { name: /enregistrer/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/aucune modification détectée/i),
      ).toBeInTheDocument();
    });

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/aucune modification détectée/i),
      ).not.toBeInTheDocument();
    });
  });

  it("devrait n'envoyer que les champs modifiés", async () => {
    const user = userEvent.setup();
    mockedAxios.get.mockResolvedValue({
      data: mockUserResponse,
    });
    mockedAxios.put.mockResolvedValue({
      data: { ...mockUser, first_name: "Jane" },
    });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
    });

    const firstNameInput = screen.getByLabelText(/prénom/i);
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Jane");

    const submitButton = screen.getByRole("button", { name: /enregistrer/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith("/users/me", {
        first_name: "Jane",
      });
    });
  });
});
