import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserProfile } from "../../../pages/management/UserProfile";
import axios from "axios";

vi.mock("axios");
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
};

const mockUserResponse = { user: mockUser };

describe("UserProfile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("devrait afficher un chargement pendant le chargement des données", () => {
        mockedAxios.get.mockImplementation(
            () => new Promise(() => {})
        );

        render(<UserProfile />);
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("devrait afficher le titre Mon profil", async () => {
        mockedAxios.get.mockResolvedValue({
            data: mockUserResponse,
        });

        render(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByText("Mon profil")).toBeInTheDocument();
        });
    });

    it("devrait afficher le formulaire avec les données utilisateur", async () => {
        mockedAxios.get.mockResolvedValue({
            data: mockUserResponse,
        });

        render(<UserProfile />);

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

        render(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
        });

        const firstNameInput = screen.getByLabelText(/prénom/i);
        await user.clear(firstNameInput);
        await user.type(firstNameInput, "Jane");

        const submitButton = screen.getByRole("button", { name: /enregistrer/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/profil mis à jour avec succès/i)).toBeInTheDocument();
        });
    });

    it("devrait afficher un message d'erreur si la mise à jour échoue", async () => {
        const user = userEvent.setup();
        mockedAxios.get.mockResolvedValue({
            data: mockUserResponse,
        });
        mockedAxios.put.mockRejectedValue(new Error("Network Error"));

        render(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
        });

        const firstNameInput = screen.getByLabelText(/prénom/i);
        await user.clear(firstNameInput);
        await user.type(firstNameInput, "Jane");

        const submitButton = screen.getByRole("button", { name: /enregistrer/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/erreur lors de la mise à jour/i)).toBeInTheDocument();
        });
    });

    it("ne devrait pas envoyer de requête si aucune modification n'a été faite", async () => {
        const user = userEvent.setup();
        mockedAxios.get.mockResolvedValue({
            data: mockUserResponse,
        });

        render(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
        });

        const submitButton = screen.getByRole("button", { name: /enregistrer/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/aucune modification détectée/i)).toBeInTheDocument();
        });
        expect(mockedAxios.put).not.toHaveBeenCalled();
    });

    it("devrait afficher un message d'erreur si le chargement échoue", async () => {
        mockedAxios.get.mockRejectedValue(new Error("Network Error"));

        render(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByText(/erreur lors du chargement du profil/i)).toBeInTheDocument();
        });
    });

    it("devrait désactiver le bouton pendant la soumission", async () => {
        const user = userEvent.setup();
        mockedAxios.get.mockResolvedValue({
            data: mockUserResponse,
        });
        mockedAxios.put.mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 100))
        );

        render(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
        });

        const firstNameInput = screen.getByLabelText(/prénom/i);
        await user.clear(firstNameInput);
        await user.type(firstNameInput, "Jane");

        const submitButton = screen.getByRole("button", { name: /enregistrer/i });
        await user.click(submitButton);

        expect(screen.getByRole("button", { name: /enregistrement\.\.\./i })).toBeDisabled();
    });

    it("devrait n'envoyer que les champs modifiés", async () => {
        const user = userEvent.setup();
        mockedAxios.get.mockResolvedValue({
            data: mockUserResponse,
        });
        mockedAxios.put.mockResolvedValue({
            data: { ...mockUser, first_name: "Jane" },
        });

        render(<UserProfile />);

        await waitFor(() => {
            expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
        });

        const firstNameInput = screen.getByLabelText(/prénom/i);
        await user.clear(firstNameInput);
        await user.type(firstNameInput, "Jane");

        const submitButton = screen.getByRole("button", { name: /enregistrer/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockedAxios.put).toHaveBeenCalledWith(
                "http://localhost:8000/api/v1/users/me",
                { first_name: "Jane" }
            );
        });
    });
});