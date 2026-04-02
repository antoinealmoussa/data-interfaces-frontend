import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Routes, Route, MemoryRouter } from "react-router-dom";
import { ProtectedRoute } from "../../../components/authentication/ProtectedRoute";
import { AuthProvider } from "../../../contexts/AuthContext";

vi.mock("../../../api/config", () => ({
    default: {
        backend: "http://localhost:8000/api/v1",
    },
}));

const renderWithProviders = (ui: React.ReactElement, initialEntry: string = '/') => {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <AuthProvider>
                {ui}
            </AuthProvider>
        </MemoryRouter>
    );
};

describe("ProtectedRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("devrait retourner null pendant le chargement", () => {
        renderWithProviders(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>
        );

        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    it("devrait rediriger vers /login si non authentifié", async () => {
        renderWithProviders(
            <Routes>
                <Route path="/login" element={<div>Login Page</div>} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <div>Protected Content</div>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        );

        await vi.waitFor(() => {
            expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
        });
    });

    it("devrait afficher le contenu si authentifié", async () => {
        localStorage.setItem("token", "test-token");
        localStorage.setItem("user", JSON.stringify({ id: 1, email: "test@test.com", first_name: "Test", surname: "User" }));
        localStorage.setItem("applications", JSON.stringify([]));

        renderWithProviders(
            <Routes>
                <Route path="/login" element={<div>Login Page</div>} />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <div>Protected Content</div>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        );

        await vi.waitFor(() => {
            expect(screen.getByText("Protected Content")).toBeInTheDocument();
        });
    });
});
