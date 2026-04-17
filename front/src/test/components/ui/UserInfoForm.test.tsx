import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserInfoForm } from "../../../components/ui/UserInfoForm";
import type { User } from "../../../types/authTypes";

const mockUser: User = {
    id: 1,
    email: "test@example.com",
    first_name: "John",
    surname: "Doe",
};

describe("UserInfoForm", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("devrait afficher les trois champs de formulaire", () => {
        render(
            <UserInfoForm
                initialData={mockUser}
                onSubmit={vi.fn()}
            />
        );

        expect(screen.getByLabelText(/prénom/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/nom de famille/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it("devrait afficher les valeurs initiales", () => {
        render(
            <UserInfoForm
                initialData={mockUser}
                onSubmit={vi.fn()}
            />
        );

        expect(screen.getByLabelText(/prénom/i)).toHaveValue("John");
        expect(screen.getByLabelText(/nom de famille/i)).toHaveValue("Doe");
        expect(screen.getByLabelText(/email/i)).toHaveValue("test@example.com");
    });

    it("devrait afficher le bouton Enregistrer", () => {
        render(
            <UserInfoForm
                initialData={mockUser}
                onSubmit={vi.fn()}
            />
        );

        expect(screen.getByRole("button", { name: /enregistrer/i })).toBeInTheDocument();
    });

    it("devrait permettre la modification des champs", async () => {
        const user = userEvent.setup();
        render(
            <UserInfoForm
                initialData={mockUser}
                onSubmit={vi.fn()}
            />
        );

        const firstNameInput = screen.getByLabelText(/prénom/i);
        await user.clear(firstNameInput);
        await user.type(firstNameInput, "Jane");

        expect(firstNameInput).toHaveValue("Jane");
    });

    it("devrait appeler onSubmit avec les données du formulaire", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <UserInfoForm
                initialData={mockUser}
                onSubmit={onSubmit}
            />
        );

        const firstNameInput = screen.getByLabelText(/prénom/i);
        await user.clear(firstNameInput);
        await user.type(firstNameInput, "Jane");

        const submitButton = screen.getByRole("button", { name: /enregistrer/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalled();
        });
        expect(onSubmit.mock.calls[0][0]).toEqual({
            first_name: "Jane",
            surname: "Doe",
            email: "test@example.com",
        });
    });

    it("devrait afficher un message d'erreur si le prénom est vide", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <UserInfoForm
                initialData={mockUser}
                onSubmit={onSubmit}
            />
        );

        const firstNameInput = screen.getByLabelText(/prénom/i);
        await user.clear(firstNameInput);

        const submitButton = screen.getByRole("button", { name: /enregistrer/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/le prénom est requis/i)).toBeInTheDocument();
        });
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("devrait afficher un message d'erreur si le nom est vide", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <UserInfoForm
                initialData={mockUser}
                onSubmit={onSubmit}
            />
        );

        const surnameInput = screen.getByLabelText(/nom de famille/i);
        await user.clear(surnameInput);

        const submitButton = screen.getByRole("button", { name: /enregistrer/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/le nom de famille est requis/i)).toBeInTheDocument();
        });
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("devrait afficher un message d'erreur si l'email est vide", async () => {
        const user = userEvent.setup();
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        render(
            <UserInfoForm
                initialData={mockUser}
                onSubmit={onSubmit}
            />
        );

        const emailInput = screen.getByLabelText(/email/i);
        await user.clear(emailInput);

        const submitButton = screen.getByRole("button", { name: /enregistrer/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/l'email est requis/i)).toBeInTheDocument();
        });
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it("devrait désactiver le bouton pendant la soumission", () => {
        const onSubmit = vi.fn().mockImplementation(() => 
            new Promise((resolve) => setTimeout(resolve, 100))
        );

        render(
            <UserInfoForm
                initialData={mockUser}
                onSubmit={onSubmit}
                isSubmitting={true}
            />
        );

        const submitButton = screen.getByRole("button", { name: /enregistrement\.\.\./i });
        expect(submitButton).toBeDisabled();
    });

    it("devrait mettre à jour le formulaire quand initialData change", async () => {
        const { rerender } = render(
            <UserInfoForm
                initialData={mockUser}
                onSubmit={vi.fn()}
            />
        );

        expect(screen.getByLabelText(/prénom/i)).toHaveValue("John");

        const newUser: User = { ...mockUser, first_name: "Jane" };
        rerender(
            <UserInfoForm
                initialData={newUser}
                onSubmit={vi.fn()}
            />
        );

        expect(screen.getByLabelText(/prénom/i)).toHaveValue("Jane");
    });
});