import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { Home } from "../../pages/Home";
import { AuthContext } from "../../contexts/AuthContext";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

vi.mock("../../api/config", () => ({
    default: {
        backend: "http://localhost:8000/api/v1",
    },
}));

const mockAuthContext = {
    isAuthenticated: true,
    isLoading: false,
    user: { id: 1, email: "test@test.com", first_name: "Jean", surname: "Dupont" },
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
        </MemoryRouter>
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
                "http://localhost:8000/api/v1/search/topic",
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

        const searchCalls = mockedAxios.get.mock.calls.filter(
            call => call[0].includes("/search/topic")
        );
        expect(searchCalls).toHaveLength(0);
    });
});
