import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../../../components/authentication/AppRoutes";
import { AuthProvider } from "../../../contexts/AuthContext";

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
        localStorage.clear();
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
});
