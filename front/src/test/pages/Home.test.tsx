import { describe, it, expect, vi, beforeEach } from "vitest";

const mockedClient = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("../../api/client", () => ({
  default: mockedClient,
}));

import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContextDefinition";
import Home from "../../pages/Home";

const mockAuthContext = {
  isAuthenticated: true,
  isLoading: false,
  user: {
    id: 1,
    email: "test@test.com",
    first_name: "Jean",
    surname: "Dupont",
  },
  applications: [],
  login: vi.fn(),
  logout: vi.fn(),
};

const renderHome = () => {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={mockAuthContext}>
        <Home />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
};

describe("Home", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait afficher le message de bienvenue avec le prénom de l'utilisateur", async () => {
    await act(async () => {
      renderHome();
    });

    await waitFor(() => {
      expect(screen.getByText(/Bonjour Jean/)).toBeInTheDocument();
    });
  });

  it("devrait afficher le champ de recherche", async () => {
    await act(async () => {
      renderHome();
    });

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Quel sujet souhaitez-vous explorer ?"),
      ).toBeInTheDocument();
    });
  });

  it("devrait faire une requête GET lors de la soumission", async () => {
    mockedClient.get.mockResolvedValueOnce({
      data: { text: "Résultat du test" },
    });

    await act(async () => {
      renderHome();
    });

    const input = await waitFor(() =>
      screen.getByPlaceholderText("Quel sujet souhaitez-vous explorer ?"),
    );

    fireEvent.change(input, { target: { value: "sujet de test" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(mockedClient.get).toHaveBeenCalledWith(
        "/search/topic",
        expect.objectContaining({
          params: { query: "sujet de test" },
        }),
      );
    });
  });

  it("devrait afficher la réponse du serveur", async () => {
    mockedClient.get.mockResolvedValueOnce({
      data: { text: "Voici la réponse du serveur" },
    });

    await act(async () => {
      renderHome();
    });

    const input = await waitFor(() =>
      screen.getByPlaceholderText("Quel sujet souhaitez-vous explorer ?"),
    );

    fireEvent.change(input, { target: { value: "ma question" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(
        screen.getByText("Voici la réponse du serveur"),
      ).toBeInTheDocument();
    });
  });

  it("devrait afficher un message d'erreur en cas d'échec", async () => {
    mockedClient.get.mockRejectedValueOnce(new Error("Erreur serveur"));

    await act(async () => {
      renderHome();
    });

    const input = await waitFor(() =>
      screen.getByPlaceholderText("Quel sujet souhaitez-vous explorer ?"),
    );

    fireEvent.change(input, { target: { value: "question" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Une erreur est survenue")).toBeInTheDocument();
    });
  });

  it("ne devrait pas faire de requête de recherche si le champ est vide", async () => {
    await act(async () => {
      renderHome();
    });

    const input = await waitFor(() =>
      screen.getByPlaceholderText("Quel sujet souhaitez-vous explorer ?"),
    );

    fireEvent.keyDown(input, { key: "Enter" });

    const searchCalls = mockedClient.get.mock.calls.filter((call) =>
      call[0].includes("/search/topic"),
    );
    expect(searchCalls).toHaveLength(0);
  });

  it("devrait afficher le détail de l'erreur quand response.data.detail est présent", async () => {
    const apiError = new Error("API error");
    (apiError as Record<string, unknown>).response = { data: { detail: "Message personnalisé" } };
    mockedClient.get.mockRejectedValue(apiError);

    await act(async () => {
      renderHome();
    });

    const input = await waitFor(() =>
      screen.getByPlaceholderText("Quel sujet souhaitez-vous explorer ?"),
    );

    fireEvent.change(input, { target: { value: "sujet" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Message personnalisé")).toBeInTheDocument();
    });
  });

  it("devrait afficher le message générique quand response.data n'a pas de detail", async () => {
    const apiError = new Error("API error");
    (apiError as Record<string, unknown>).response = { data: {} };
    mockedClient.get.mockRejectedValue(apiError);

    await act(async () => {
      renderHome();
    });

    const input = await waitFor(() =>
      screen.getByPlaceholderText("Quel sujet souhaitez-vous explorer ?"),
    );

    fireEvent.change(input, { target: { value: "sujet" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByText("Une erreur est survenue")).toBeInTheDocument();
    });
  });
});
