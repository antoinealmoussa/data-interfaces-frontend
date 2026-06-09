import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import { Home } from "../../pages/Home";
import axios from "axios";
const mockedAxios = vi.mocked(axios, true);

vi.mock("../../api/config", () => ({
  default: {
    backend: "http://localhost:8000/api/v1",
  },
}));

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
    mockedAxios.get.mockResolvedValueOnce({
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
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/search/topic",
        expect.objectContaining({
          params: { query: "sujet de test" },
        }),
      );
    });
  });

  it("devrait afficher la réponse du serveur", async () => {
    mockedAxios.get.mockResolvedValueOnce({
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
    mockedAxios.get.mockRejectedValueOnce(new Error("Erreur serveur"));

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

    const searchCalls = mockedAxios.get.mock.calls.filter((call) =>
      call[0].includes("/search/topic"),
    );
    expect(searchCalls).toHaveLength(0);
  });

  it("devrait afficher le détail de l'erreur quand response.data.detail est présent", async () => {
    const axiosError = new Error("Axios error");
    (axiosError as any).isAxiosError = true;
    (axiosError as any).response = { data: { detail: "Message personnalisé" } };
    mockedAxios.get.mockRejectedValue(axiosError);
    mockedAxios.isAxiosError = vi.fn().mockReturnValue(true);

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
    const axiosError = new Error("Axios error");
    (axiosError as any).isAxiosError = true;
    (axiosError as any).response = { data: {} };
    mockedAxios.get.mockRejectedValue(axiosError);
    mockedAxios.isAxiosError = vi.fn().mockReturnValue(true);

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
