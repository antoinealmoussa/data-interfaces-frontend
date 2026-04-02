import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "../../../components/layout/Header";
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

describe("Header", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("devrait rendre le Header avec la bonne hauteur", async () => {
        localStorage.setItem("token", "test-token");
        localStorage.setItem("user", JSON.stringify({ id: 1, email: "test@test.com", first_name: "Test", surname: "User" }));
        localStorage.setItem("applications", JSON.stringify([]));

        renderWithProviders(
            <Routes>
                <Route path="/" element={<Header height={60} />} />
            </Routes>
        );

        await vi.waitFor(() => {
            const headerBox = document.querySelector('[class*="MuiBox-root"]');
            expect(headerBox).toBeInTheDocument();
        });
    });

    it("devrait afficher le nom de l'utilisateur connecté dans le menu", async () => {
        const user = userEvent.setup();
        localStorage.setItem("token", "test-token");
        localStorage.setItem("user", JSON.stringify({ id: 1, email: "test@test.com", first_name: "John", surname: "Doe" }));
        localStorage.setItem("applications", JSON.stringify([]));

        renderWithProviders(
            <Routes>
                <Route path="/" element={<Header height={60} />} />
            </Routes>
        );

        const button = screen.getByRole("button");
        await user.hover(button);

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });
    });

    it("devrait avoir un lien vers le logo", async () => {
        localStorage.setItem("token", "test-token");
        localStorage.setItem("user", JSON.stringify({ id: 1, email: "test@test.com", first_name: "Test", surname: "User" }));
        localStorage.setItem("applications", JSON.stringify([]));

        renderWithProviders(
            <Routes>
                <Route path="/" element={<Header height={60} />} />
            </Routes>
        );

        await vi.waitFor(() => {
            const logoLink = document.querySelector('a[href="/"]');
            expect(logoLink).toBeInTheDocument();
        });
    });
});
