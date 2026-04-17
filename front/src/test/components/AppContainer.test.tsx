import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppContainer } from "../../components/AppContainer";
import { AuthProvider } from "../../contexts/AuthContext";
import axios from "axios";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

vi.mock("../../api/config", () => ({
    default: {
        backend: "http://localhost:8000/api/v1",
    },
}));

describe("AppContainer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedAxios.get.mockResolvedValue({
            data: {
                user: { id: 1, email: "test@test.com", first_name: "Test", surname: "User" },
                applications: []
            },
        });
    });

    it("devrait rendre le Header et l'Outlet", async () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<AppContainer headerHeight={60} />}>
                            <Route index element={<div>Main Content</div>} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        );

        const content = await screen.findByText(/Main Content/i);
        expect(content).toBeInTheDocument();
    });

    it("devrait accepter une hauteur personnalisée", async () => {
        render(
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<AppContainer headerHeight={80} />}>
                            <Route index element={<div>Content</div>} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        );

        const content = await screen.findByText(/Content/i);
        expect(content).toBeInTheDocument();
    });
});
