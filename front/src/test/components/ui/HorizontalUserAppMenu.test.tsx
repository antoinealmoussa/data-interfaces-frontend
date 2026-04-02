import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { HorizontalUserAppMenu } from "../../../components/ui/HorizontalUserAppMenu";
import { AuthProvider } from "../../../contexts/AuthContext";

vi.mock("../../../api/config", () => ({
    default: {
        backend: "http://localhost:8000/api/v1",
    },
}));

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                {ui}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe("HorizontalUserAppMenu", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("devrait retourner null si aucune application n'est disponible", () => {
        const { container } = renderWithProviders(<HorizontalUserAppMenu />);
        expect(container.firstChild).toBeNull();
    });

    it("devrait afficher les menus des applications si disponibles", async () => {
        localStorage.setItem("token", "test-token");
        localStorage.setItem("user", JSON.stringify({ id: 1, email: "test@test.com", first_name: "Test", surname: "User" }));
        localStorage.setItem("applications", JSON.stringify([
            { name: "bike-exploration", pretty_name: "Bike Exploration" }
        ]));

        renderWithProviders(<HorizontalUserAppMenu />);

        await vi.waitFor(() => {
            expect(screen.getByText("Bike Exploration")).toBeInTheDocument();
        });
    });

    it("devrait afficher plusieurs applications", async () => {
        localStorage.setItem("token", "test-token");
        localStorage.setItem("user", JSON.stringify({ id: 1, email: "test@test.com", first_name: "Test", surname: "User" }));
        localStorage.setItem("applications", JSON.stringify([
            { name: "bike-exploration", pretty_name: "Bike Exploration" },
            { name: "rugby-teams", pretty_name: "Rugby Teams" }
        ]));

        renderWithProviders(<HorizontalUserAppMenu />);

        await vi.waitFor(() => {
            expect(screen.getByText("Bike Exploration")).toBeInTheDocument();
            expect(screen.getByText("Rugby Teams")).toBeInTheDocument();
        });
    });
});
