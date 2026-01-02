import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignInForm } from "../../../components/authentication/SignInForm";
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

describe("SignInForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("devrait afficher tous les champs du formulaire", () => {
        renderWithRouter(<SignInForm />);

        expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/nom de famille/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    });

    it("devrait afficher le bouton d'inscription", () => {
        renderWithRouter(<SignInForm />);

        expect(screen.getByRole("button", { name: /s'inscrire/i })).toBeInTheDocument();
    });

    it("devrait permettre la saisie de tous les champs", async () => {
        const user = userEvent.setup();
        renderWithRouter(<SignInForm />);

        const firstNameInput = screen.getByLabelText(/prénom/i);
        const surnameInput = screen.getByLabelText(/nom de famille/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/mot de passe/i);

        await user.type(firstNameInput, "John");
        await user.type(surnameInput, "Doe");
        await user.type(emailInput, "john.doe@example.com");
        await user.type(passwordInput, "password123");

        expect(firstNameInput).toHaveValue("John");
        expect(surnameInput).toHaveValue("Doe");
        expect(emailInput).toHaveValue("john.doe@example.com");
        expect(passwordInput).toHaveValue("password123");
    });

    it("devrait soumettre le formulaire avec les données correctes", async () => {
        const user = userEvent.setup();
        mockedAxios.post.mockResolvedValueOnce({
            data: { message: "Inscription réussie" },
        });

        renderWithRouter(<SignInForm />);

        const firstNameInput = screen.getByLabelText(/prénom/i);
        const surnameInput = screen.getByLabelText(/nom de famille/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/mot de passe/i);
        const submitButton = screen.getByRole("button", { name: /s'inscrire/i });

        await user.type(firstNameInput, "John");
        await user.type(surnameInput, "Doe");
        await user.type(emailInput, "john.doe@example.com");
        await user.type(passwordInput, "password123");
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalledWith(
                "http://localhost:8000/api/v1/users/sign-in",
                JSON.stringify({
                    firstName: "John",
                    surname: "Doe",
                    email: "john.doe@example.com",
                    password: "password123",
                })
            );
        });
    });

    it("devrait afficher 'Inscription...' pendant la soumission", async () => {
        const user = userEvent.setup();
        mockedAxios.post.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => resolve({ data: {} }), 100);
                })
        );

        renderWithRouter(<SignInForm />);

        const firstNameInput = screen.getByLabelText(/prénom/i);
        const surnameInput = screen.getByLabelText(/nom de famille/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/mot de passe/i);
        const submitButton = screen.getByRole("button", { name: /s'inscrire/i });

        await user.type(firstNameInput, "John");
        await user.type(surnameInput, "Doe");
        await user.type(emailInput, "john.doe@example.com");
        await user.type(passwordInput, "password123");
        await user.click(submitButton);

        expect(screen.getByRole("button", { name: /inscription\.\.\./i })).toBeInTheDocument();
    });

    it("devrait afficher la citation de Wout Van Aert", () => {
        renderWithRouter(<SignInForm />);

        expect(screen.getByText(/Roule aussi vite que t'es con/)).toBeInTheDocument();
        expect(screen.getByText(/Wout Van Aert/)).toBeInTheDocument();
    });
});

