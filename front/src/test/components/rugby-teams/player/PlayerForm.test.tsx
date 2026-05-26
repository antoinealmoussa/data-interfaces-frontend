import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayerForm } from "../../../../components/rugby-teams/player/PlayerForm";

describe("PlayerForm", () => {
    const mockSubmit = vi.fn();
    const mockCancel = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("devrait rendre tous les champs en mode création", () => {
        render(<PlayerForm onSubmit={mockSubmit} onCancel={mockCancel} />);

        expect(screen.getByLabelText("Nom")).toBeInTheDocument();
        expect(screen.getAllByText("Niveau").length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText("Sexe").length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText("Poste").length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText("Catégories").length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText("Enregistrer")).toBeInTheDocument();
        expect(screen.getByText("Annuler")).toBeInTheDocument();
    });

    it("devrait pré-remplir les champs en mode édition", () => {
        render(
            <PlayerForm
                defaultValues={{
                    id: 1,
                    name: "Jean Dupont",
                    level: 3,
                    sex: "H",
                    position: "Meneur",
                    team_name: "Mon equipe",
                    category_names: ["Mixte", "+35"],
                }}
                onSubmit={mockSubmit}
                onCancel={mockCancel}
            />,
        );

        const nameInput = screen.getByLabelText("Nom") as HTMLInputElement;
        expect(nameInput.value).toBe("Jean Dupont");
    });

    it("devrait appeler onSubmit avec les données du formulaire", async () => {
        const user = userEvent.setup();
        mockSubmit.mockResolvedValue(undefined);

        render(
            <PlayerForm
                defaultValues={{
                    id: 1,
                    name: "",
                    level: 2,
                    sex: "H",
                    position: "Ailier",
                    team_name: "Mon equipe",
                    category_names: ["Mixte"],
                }}
                onSubmit={mockSubmit}
                onCancel={mockCancel}
            />,
        );

        await user.type(screen.getByLabelText("Nom"), "Pierre");
        await user.click(screen.getByText("Enregistrer"));

        await waitFor(() => {
            expect(mockSubmit).toHaveBeenCalled();
        });

        const callArg = mockSubmit.mock.calls[0][0];
        expect(callArg.name).toBe("Pierre");
        expect(callArg.category_names).toEqual(["Mixte"]);
    });

    it("devrait afficher les erreurs de validation", async () => {
        const user = userEvent.setup();

        render(<PlayerForm onSubmit={mockSubmit} onCancel={mockCancel} />);

        await user.click(screen.getByText("Enregistrer"));

        await waitFor(() => {
            expect(screen.getByText("Le nom est obligatoire")).toBeInTheDocument();
        });
    });

    it("devrait appeler onCancel au clic sur Annuler", async () => {
        const user = userEvent.setup();

        render(<PlayerForm onSubmit={mockSubmit} onCancel={mockCancel} />);

        await user.click(screen.getByText("Annuler"));

        expect(mockCancel).toHaveBeenCalledTimes(1);
    });

    it("devrait désactiver les boutons pendant la soumission", async () => {
        const user = userEvent.setup();
        let resolvePromise: () => void;
        const submitPromise = new Promise<void>((resolve) => {
            resolvePromise = resolve;
        });
        mockSubmit.mockReturnValue(submitPromise);

        render(
            <PlayerForm
                defaultValues={{
                    id: 1,
                    name: "Pierre",
                    level: 2,
                    sex: "H",
                    position: "Ailier",
                    team_name: "Mon equipe",
                    category_names: ["Mixte"],
                }}
                onSubmit={mockSubmit}
                onCancel={mockCancel}
            />,
        );

        await user.click(screen.getByText("Enregistrer"));

        await waitFor(() => {
            expect(screen.getByText("Enregistrement...")).toBeInTheDocument();
        });

        resolvePromise!();
    });

    it("devrait afficher les catégories sous forme de chips en mode édition", () => {
        render(
            <PlayerForm
                defaultValues={{
                    id: 1,
                    name: "Jean",
                    level: 2,
                    sex: "H",
                    position: "Ailier",
                    team_name: "Mon equipe",
                    category_names: ["Mixte", "+35"],
                }}
                onSubmit={mockSubmit}
                onCancel={mockCancel}
            />,
        );

        expect(screen.getByText("Mixte")).toBeInTheDocument();
        expect(screen.getByText("+35")).toBeInTheDocument();
    });
});
