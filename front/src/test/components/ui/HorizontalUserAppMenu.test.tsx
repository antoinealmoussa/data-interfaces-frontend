import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HorizontalUserAppMenu } from "../../../components/ui/HorizontalUserAppMenu";
import { AuthContext } from "../../../contexts/AuthContext";

describe("HorizontalUserAppMenu", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("devrait retourner null si aucune application n'est disponible", async () => {
        const mockAuthContext = {
            isAuthenticated: true,
            isLoading: false,
            user: { id: 1, email: "test@test.com", first_name: "Test", surname: "User" },
            applications: null,
            token: "test-token",
            login: vi.fn(),
            logout: vi.fn(),
        };

        const { container } = render(
            <BrowserRouter>
                <AuthContext.Provider value={mockAuthContext}>
                    <HorizontalUserAppMenu />
                </AuthContext.Provider>
            </BrowserRouter>
        );

        expect(container.firstChild).toBeNull();
    });

    it("devrait afficher les menus des applications si disponibles", async () => {
        const mockAuthContext = {
            isAuthenticated: true,
            isLoading: false,
            user: { id: 1, email: "test@test.com", first_name: "Test", surname: "User" },
            applications: [{ name: "bike-exploration", pretty_name: "Bike Exploration" }],
            token: "test-token",
            login: vi.fn(),
            logout: vi.fn(),
        };

        await act(async () => {
            render(
                <BrowserRouter>
                    <AuthContext.Provider value={mockAuthContext}>
                        <HorizontalUserAppMenu />
                    </AuthContext.Provider>
                </BrowserRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText("Bike Exploration")).toBeInTheDocument();
        });
    });

    it("devrait afficher plusieurs applications", async () => {
        const mockAuthContext = {
            isAuthenticated: true,
            isLoading: false,
            user: { id: 1, email: "test@test.com", first_name: "Test", surname: "User" },
            applications: [
                { name: "bike-exploration", pretty_name: "Bike Exploration" },
                { name: "rugby-teams", pretty_name: "Rugby Teams" }
            ],
            token: "test-token",
            login: vi.fn(),
            logout: vi.fn(),
        };

        await act(async () => {
            render(
                <BrowserRouter>
                    <AuthContext.Provider value={mockAuthContext}>
                        <HorizontalUserAppMenu />
                    </AuthContext.Provider>
                </BrowserRouter>
            );
        });

        await waitFor(() => {
            expect(screen.getByText("Bike Exploration")).toBeInTheDocument();
            expect(screen.getByText("Rugby Teams")).toBeInTheDocument();
        });
    });
});
