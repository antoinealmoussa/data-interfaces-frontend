import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MultiTypeMenuItem } from "../../../components/ui/MultiTypeMenuItem";
import { BrowserRouter } from "react-router-dom";
import { Home } from "@mui/icons-material";
import type { MenuItemConfig } from "../../../types/uiTypes";

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("MultiTypeMenuItem", () => {
    describe("Type 'label'", () => {
        it("devrait afficher un élément de menu désactivé avec le label", () => {
            const labelItem: MenuItemConfig = {
                type: "label",
                label: "Section Label",
            };

            renderWithRouter(<MultiTypeMenuItem item={labelItem} />);

            const menuItem = screen.getByRole("menuitem");
            expect(menuItem).toBeInTheDocument();
            expect(menuItem).toHaveAttribute("aria-disabled", "true");
            expect(screen.getByText("Section Label")).toBeInTheDocument();
        });

        it("devrait être désactivé même si une icône est fournie", () => {
            const labelItem: MenuItemConfig = {
                type: "label",
                label: "Section avec icône",
                icon: Home,
            };

            renderWithRouter(<MultiTypeMenuItem item={labelItem} />);

            const menuItem = screen.getByRole("menuitem");
            expect(menuItem).toHaveAttribute("aria-disabled", "true");
            expect(screen.getByText("Section avec icône")).toBeInTheDocument();
        });
    });

    describe("Type 'link'", () => {
        it("devrait afficher un lien avec le label et le href", () => {
            const linkItem: MenuItemConfig = {
                type: "link",
                label: "Accueil",
                href: "/home",
            };

            renderWithRouter(<MultiTypeMenuItem item={linkItem} />);

            const link = screen.getByRole("menuitem");
            expect(link).toBeInTheDocument();
            expect(link).toHaveAttribute("href", "/home");
            expect(screen.getByText("Accueil")).toBeInTheDocument();
        });

        it("devrait fonctionner avec différents chemins href", () => {
            const linkItem: MenuItemConfig = {
                type: "link",
                label: "Profil",
                href: "/users/profile",
            };

            renderWithRouter(<MultiTypeMenuItem item={linkItem} />);

            const link = screen.getByRole("menuitem");
            expect(link).toHaveAttribute("href", "/users/profile");
            expect(screen.getByText("Profil")).toBeInTheDocument();
        });
    });

    describe("Type 'action'", () => {
        it("devrait afficher un élément de menu cliquable sans icône", async () => {
            const mockOnClick = vi.fn();
            const actionItem: MenuItemConfig = {
                type: "action",
                label: "Déconnexion",
                onClick: mockOnClick,
            };

            renderWithRouter(<MultiTypeMenuItem item={actionItem} />);

            const menuItem = screen.getByRole("menuitem");
            expect(menuItem).toBeInTheDocument();
            expect(screen.getByText("Déconnexion")).toBeInTheDocument();

            const user = userEvent.setup();
            await user.click(menuItem);

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it("devrait afficher un élément de menu cliquable avec icône", async () => {
            const mockOnClick = vi.fn();
            const actionItem: MenuItemConfig = {
                type: "action",
                label: "Sauvegarder",
                icon: Home,
                onClick: mockOnClick,
            };

            renderWithRouter(<MultiTypeMenuItem item={actionItem} />);

            const menuItem = screen.getByRole("menuitem");
            expect(menuItem).toBeInTheDocument();
            expect(screen.getByText("Sauvegarder")).toBeInTheDocument();

            // Vérifier que l'icône est présente (elle devrait être rendue par MUI)
            const iconElement = menuItem.querySelector("svg");
            expect(iconElement).toBeInTheDocument();

            const user = userEvent.setup();
            await user.click(menuItem);

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it("devrait appeler onClick plusieurs fois si cliqué plusieurs fois", async () => {
            const mockOnClick = vi.fn();
            const actionItem: MenuItemConfig = {
                type: "action",
                label: "Action multiple",
                onClick: mockOnClick,
            };

            renderWithRouter(<MultiTypeMenuItem item={actionItem} />);

            const menuItem = screen.getByRole("menuitem");
            const user = userEvent.setup();

            await user.click(menuItem);
            await user.click(menuItem);
            await user.click(menuItem);

            expect(mockOnClick).toHaveBeenCalledTimes(3);
        });
    });

    describe("Type inconnu ou invalide", () => {
        it("devrait retourner null pour un type non défini", () => {
            const invalidItem = {
                type: "unknown" as const,
                label: "Test",
            };

            const { container } = renderWithRouter(
                <MultiTypeMenuItem item={invalidItem as MenuItemConfig} />
            );

            expect(container.firstChild).toBeNull();
        });
    });

    describe("Intégration", () => {
        it("devrait rendre correctement différents types d'éléments dans une liste", () => {
            const items: MenuItemConfig[] = [
                { type: "label", label: "Paramètres" },
                { type: "link", label: "Accueil", href: "/" },
                {
                    type: "action",
                    label: "Action",
                    onClick: vi.fn(),
                },
            ];

            renderWithRouter(
                <>
                    {items.map((item, index) => (
                        <MultiTypeMenuItem key={index} item={item} />
                    ))}
                </>
            );

            expect(screen.getByText("Paramètres")).toBeInTheDocument();
            expect(screen.getByText("Accueil")).toBeInTheDocument();
            expect(screen.getByText("Action")).toBeInTheDocument();
        });
    });
});

