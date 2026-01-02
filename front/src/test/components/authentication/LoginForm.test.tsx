import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "../../../components/authentication/LoginForm";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";

// Mock axios
vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

// Mock de la config API
vi.mock("../../../api/config", () => ({
    default: {
        authentication: "http://localhost:8000/api/v1/users",
    },
}));

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("LoginForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("devrait afficher les champs email et mot de passe", () => {
        renderWithRouter(<LoginForm />);

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    it("devrait afficher le bouton de connexion", () => {
        renderWithRouter(<LoginForm />);

        expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument();
    });

    it("devrait afficher le bouton d'inscription", () => {
        renderWithRouter(<LoginForm />);

        expect(screen.getByRole("link", { name: /s'inscrire/i })).toBeInTheDocument();
    });

    it("devrait permettre la saisie d'email et de mot de passe", async () => {
        const user = userEvent.setup();
        renderWithRouter(<LoginForm />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/mot de passe/i);

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");

        expect(emailInput).toHaveValue("test@example.com");
        expect(passwordInput).toHaveValue("password123");
    });

    it("devrait soumettre le formulaire avec les données correctes", async () => {
        const user = userEvent.setup();
        mockedAxios.post.mockResolvedValueOnce({
            data: { message: "Connexion réussie" },
        });

        renderWithRouter(<LoginForm />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/mot de passe/i);
        const submitButton = screen.getByRole("button", { name: /se connecter/i });

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith(
                "http://localhost:8000/api/v1/users/login",
                JSON.stringify({
                    email: "test@example.com",
                    password: "password123",
                })
            );
        });
    });

    it("devrait afficher 'Connexion...' pendant la soumission", async () => {
        const user = userEvent.setup();
        mockedAxios.post.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve({ data: {} }), 100);
                })
        );

        renderWithRouter(<LoginForm />);

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/mot de passe/i);
        const submitButton = screen.getByRole("button", { name: /se connecter/i });

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");
        await user.click(submitButton);

        expect(screen.getByRole("button", { name: /connexion\.\.\./i })).toBeInTheDocument();
    });

    it("devrait afficher la citation de Wout Van Aert", () => {
        renderWithRouter(<LoginForm />);

        expect(screen.getByText(/Roule aussi vite que t'es con/)).toBeInTheDocument();
        expect(screen.getByText(/Wout Van Aert/)).toBeInTheDocument();
    });
});

