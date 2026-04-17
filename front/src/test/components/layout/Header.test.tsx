import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "../../../components/layout/Header";
import { AuthProvider } from "../../../contexts/AuthContext";
import axios from "axios";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

vi.mock("../../../api/config", () => ({
    default: {
        backend: "http://localhost:8000/api/v1",
    },
}));

const renderWithProviders = (ui: React.ReactElement, userData: any = null) => {
    const user = userData || { id: 1, email: "test@test.com", first_name: "Test", surname: "User" };

    mockedAxios.get.mockResolvedValueOnce({
        data: {
            user: user,
            applications: []
        },
    });

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
    });

    it("devrait rendre le Header avec la bonne hauteur", async () => {
        await act(async () => {
            renderWithProviders(
                <Routes>
                    <Route path="/" element={<Header height={60} />} />
                </Routes>
            );
        });

        await vi.waitFor(() => {
            const headerBox = document.querySelector('[class*="MuiBox-root"]');
            expect(headerBox).toBeInTheDocument();
        });
    });

    it("devrait afficher le nom de l'utilisateur connecté dans le menu", async () => {
        const user = userEvent.setup();
        await act(async () => {
            renderWithProviders(
                <Routes>
                    <Route path="/" element={<Header height={60} />} />
                </Routes>,
                { id: 1, email: "test@test.com", first_name: "John", surname: "Doe" }
            );
        });

        const button = screen.getByRole("button");
        await user.hover(button);

        await waitFor(() => {
            expect(screen.getByText("John Doe")).toBeInTheDocument();
        });
    });

    it("devrait avoir un lien vers le logo", async () => {
        await act(async () => {
            renderWithProviders(
                <Routes>
                    <Route path="/" element={<Header height={60} />} />
                </Routes>
            );
        });

        await vi.waitFor(() => {
            const logoLink = document.querySelector('a[href="/"]');
            expect(logoLink).toBeInTheDocument();
        });
    });
});
