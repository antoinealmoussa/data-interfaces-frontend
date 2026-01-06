import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import { BrowserRouter } from "react-router-dom";
import { Home, Settings } from "@mui/icons-material";
import type { DropdownMenuProps } from "../../../types/uiTypes";

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("DropdownMenu", () => {
    const createMockMenuItems = (): DropdownMenuProps["menuItems"] => [
        {
            item: {
                type: "label",
                label: "Section 1",
            },
        },
        {
            item: {
                type: "link",
                label: "Accueil",
                href: "/home",
            },
        },
        {
            item: {
                type: "action",
                label: "Action",
                onClick: vi.fn(),
            },
        },
    ];

    describe("Rendu initial", () => {
        it("devrait afficher le bouton avec le label", () => {
            const menuItems = createMockMenuItems();

            renderWithRouter(<DropdownMenu label="Menu" menuItems={menuItems} />);

            const button = screen.getByRole("button", { name: /menu/i });
            expect(button).toBeInTheDocument();
            expect(button).toHaveTextContent("Menu");
        });

        it("devrait afficher le bouton avec le label et l'icône", () => {
            const menuItems = createMockMenuItems();

            renderWithRouter(
                <DropdownMenu label="Menu" icon={Home} menuItems={menuItems} />
            );

            const button = screen.getByRole("button", { name: /menu/i });
            expect(button).toBeInTheDocument();

            // Vérifier que l'icône est présente
            const iconElement = button.querySelector("svg");
            expect(iconElement).toBeInTheDocument();
        });

        it("devrait afficher l'icône de flèche vers le bas", () => {
            const menuItems = createMockMenuItems();

            renderWithRouter(<DropdownMenu label="Menu" menuItems={menuItems} />);

            const button = screen.getByRole("button", { name: /menu/i });
            const icons = button.querySelectorAll("svg");
            // Il devrait y avoir au moins l'icône ArrowDropDown
            expect(icons.length).toBeGreaterThan(0);
        });

        it("devrait ne pas afficher le menu initialement", () => {
            const menuItems = createMockMenuItems();

            renderWithRouter(<DropdownMenu label="Menu" menuItems={menuItems} />);

            expect(screen.queryByText("Accueil")).not.toBeInTheDocument();
            expect(screen.queryByText("Section 1")).not.toBeInTheDocument();
        });
    });

    describe("Ouverture et fermeture du menu", () => {
        it("devrait ouvrir le menu au survol du bouton", async () => {
            const user = userEvent.setup();
            const menuItems = createMockMenuItems();

            renderWithRouter(<DropdownMenu label="Menu" menuItems={menuItems} />);

            const button = screen.getByRole("button", { name: /menu/i });

            await user.hover(button);

            await waitFor(() => {
                expect(screen.getByText("Section 1")).toBeInTheDocument();
                expect(screen.getByText("Accueil")).toBeInTheDocument();
                expect(screen.getByText("Action")).toBeInTheDocument();
            });
        });

        it("devrait fermer le menu quand on quitte la liste du menu", async () => {
            const user = userEvent.setup();
            const menuItems = createMockMenuItems();

            renderWithRouter(
                <div>
                    <div data-testid="outside">Extérieur</div>
                    <DropdownMenu label="Menu" menuItems={menuItems} />
                </div>
            );

            const button = screen.getByRole("button", { name: /menu/i });

            await user.hover(button);

            await waitFor(() => {
                expect(screen.getByText("Accueil")).toBeInTheDocument();
            });

            const menu = screen.getByRole("menu");

            fireEvent.mouseLeave(menu);

            await waitFor(
                () => {
                    expect(screen.queryByText("Accueil")).not.toBeInTheDocument();
                },
                { timeout: 2000 }
            );
        });
    });

    describe("Affichage des éléments de menu", () => {
        it("devrait afficher tous les éléments de menu lorsqu'il est ouvert", async () => {
            const user = userEvent.setup();
            const menuItems = createMockMenuItems();

            renderWithRouter(<DropdownMenu label="Menu" menuItems={menuItems} />);

            const button = screen.getByRole("button", { name: /menu/i });
            await user.hover(button);

            await waitFor(() => {
                expect(screen.getByText("Section 1")).toBeInTheDocument();
                expect(screen.getByText("Accueil")).toBeInTheDocument();
                expect(screen.getByText("Action")).toBeInTheDocument();
            });
        });

        it("devrait afficher un menu vide sans erreur", async () => {
            const user = userEvent.setup();

            renderWithRouter(<DropdownMenu label="Menu" menuItems={[]} />);

            const button = screen.getByRole("button", { name: /menu/i });
            await user.hover(button);

            // Le menu devrait s'ouvrir même s'il est vide
            await waitFor(() => {
                const menu = screen.queryByRole("menu");
                expect(menu).toBeInTheDocument();
            });
        });

        it("devrait afficher plusieurs éléments de différents types", async () => {
            const user = userEvent.setup();
            const menuItems: DropdownMenuProps["menuItems"] = [
                {
                    item: {
                        type: "label",
                        label: "Paramètres",
                    },
                },
                {
                    item: {
                        type: "link",
                        label: "Profil",
                        href: "/profile",
                    },
                },
                {
                    item: {
                        type: "action",
                        label: "Déconnexion",
                        onClick: vi.fn(),
                    },
                },
                {
                    item: {
                        type: "action",
                        label: "Sauvegarder",
                        icon: Settings,
                        onClick: vi.fn(),
                    },
                },
            ];

            renderWithRouter(<DropdownMenu label="Menu" menuItems={menuItems} />);

            const button = screen.getByRole("button", { name: /menu/i });
            await user.hover(button);

            await waitFor(() => {
                expect(screen.getByText("Paramètres")).toBeInTheDocument();
                expect(screen.getByText("Profil")).toBeInTheDocument();
                expect(screen.getByText("Déconnexion")).toBeInTheDocument();
                expect(screen.getByText("Sauvegarder")).toBeInTheDocument();
            });
        });
    });

    describe("Interactions avec les éléments de menu", () => {
        it("devrait appeler onClick quand on clique sur un élément action", async () => {
            const user = userEvent.setup();
            const mockOnClick = vi.fn();
            const menuItems: DropdownMenuProps["menuItems"] = [
                {
                    item: {
                        type: "action",
                        label: "Action Test",
                        onClick: mockOnClick,
                    },
                },
            ];

            renderWithRouter(<DropdownMenu label="Menu" menuItems={menuItems} />);

            const button = screen.getByRole("button", { name: /menu/i });
            await user.hover(button);

            await waitFor(() => {
                expect(screen.getByText("Action Test")).toBeInTheDocument();
            });

            const actionItem = screen.getByText("Action Test");
            await user.click(actionItem);

            expect(mockOnClick).toHaveBeenCalledTimes(1);
        });

        it("devrait permettre la navigation vers un lien", async () => {
            const user = userEvent.setup();
            const menuItems: DropdownMenuProps["menuItems"] = [
                {
                    item: {
                        type: "link",
                        label: "Accueil",
                        href: "/home",
                    },
                },
            ];

            renderWithRouter(<DropdownMenu label="Menu" menuItems={menuItems} />);

            const button = screen.getByRole("button", { name: /menu/i });
            await user.hover(button);

            await waitFor(() => {
                const link = screen.getByRole("menuitem", { name: /accueil/i });
                expect(link).toBeInTheDocument();
                expect(link).toHaveAttribute("href", "/home");
            });
        });

        it("devrait gérer plusieurs actions indépendamment", async () => {
            const user = userEvent.setup();
            const mockOnClick1 = vi.fn();
            const mockOnClick2 = vi.fn();
            const menuItems: DropdownMenuProps["menuItems"] = [
                {
                    item: {
                        type: "action",
                        label: "Action 1",
                        onClick: mockOnClick1,
                    },
                },
                {
                    item: {
                        type: "action",
                        label: "Action 2",
                        onClick: mockOnClick2,
                    },
                },
            ];

            renderWithRouter(<DropdownMenu label="Menu" menuItems={menuItems} />);

            const button = screen.getByRole("button", { name: /menu/i });
            await user.hover(button);

            await waitFor(() => {
                expect(screen.getByText("Action 1")).toBeInTheDocument();
                expect(screen.getByText("Action 2")).toBeInTheDocument();
            });

            await user.click(screen.getByText("Action 1"));
            expect(mockOnClick1).toHaveBeenCalledTimes(1);
            expect(mockOnClick2).not.toHaveBeenCalled();

            await user.hover(button);

            await user.click(screen.getByText("Action 2"));
            expect(mockOnClick2).toHaveBeenCalledTimes(1);
            expect(mockOnClick1).toHaveBeenCalledTimes(1);
        });
    });

    describe("Gestion du label optionnel", () => {
        it("devrait fonctionner sans label", () => {
            const menuItems = createMockMenuItems();

            renderWithRouter(<DropdownMenu menuItems={menuItems} />);

            const button = screen.getByRole("button");
            expect(button).toBeInTheDocument();
        });
    });

    describe("Styles et accessibilité", () => {
        it("devrait avoir le bon type de curseur sur le bouton", () => {
            const menuItems = createMockMenuItems();

            renderWithRouter(<DropdownMenu label="Menu" menuItems={menuItems} />);

            const button = screen.getByRole("button", { name: /menu/i });
            expect(button).toHaveStyle({ cursor: "pointer" });
        });
    });
});

