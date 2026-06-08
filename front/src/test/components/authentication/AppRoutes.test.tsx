import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../components/authentication/AppRoutes";
import { AuthProvider } from "../../../contexts/AuthContext";
import axios from "axios";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

vi.mock("../../../api/config", () => ({
    default: {
        backend: "http://localhost:8000/api/v1",
    },
}));

const renderWithProviders = (initialEntries: string[]) => {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </MemoryRouter>
    );
};

describe("AppRoutes", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedAxios.get.mockRejectedValue(new Error("No auth"));
    });

    it("devrait afficher la page de login pour /login", async () => {
        renderWithProviders(["/login"]);

        await vi.waitFor(() => {
            expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        });
    });

    it("devrait afficher la page d'inscription pour /register", async () => {
        renderWithProviders(["/register"]);

        await vi.waitFor(() => {
            expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
        });
    });

    it("devrait afficher la page d'accueil pour / quand authentifié", async () => {
        mockedAxios.get.mockResolvedValue({
            data: {
                user: { id: 1, email: "test@test.com", first_name: "Jean", surname: "Dupont" },
                applications: [],
            },
        });

        renderWithProviders(["/"]);

        await vi.waitFor(() => {
            expect(screen.getByText(/Bonjour Jean/)).toBeInTheDocument();
        });
    });

    it("devrait afficher les routes dynamiques pour les applications de l'utilisateur", async () => {
        mockedAxios.get.mockResolvedValue({
            data: {
                user: { id: 1, email: "test@test.com", first_name: "Jean", surname: "Dupont" },
                applications: [{ name: "rugby-teams", pretty_name: "Rugby Teams" }],
            },
        });

        renderWithProviders(["/rugby-teams"]);

        await vi.waitFor(() => {
            expect(screen.getByText(/Chargement\.\.\./i)).toBeInTheDocument();
        });
    });

    it("ne devrait pas afficher les routes dynamiques sans applications", async () => {
        mockedAxios.get.mockResolvedValue({
            data: {
                user: { id: 1, email: "test@test.com", first_name: "Jean", surname: "Dupont" },
                applications: [],
            },
        });

        renderWithProviders(["/rugby-teams"]);

        await vi.waitFor(() => {
            expect(screen.queryByText(/Chargement\.\.\./i)).not.toBeInTheDocument();
        });
    });
});
