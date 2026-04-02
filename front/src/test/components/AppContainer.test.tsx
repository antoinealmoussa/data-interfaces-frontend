import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppContainer } from "../../components/AppContainer";
import { AuthProvider } from "../../contexts/AuthContext";

vi.mock("../../api/config", () => ({
    default: {
        backend: "http://localhost:8000/api/v1",
    },
}));

describe("AppContainer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("devrait rendre le Header et l'Outlet", async () => {
        localStorage.setItem("token", "test-token");
        localStorage.setItem("user", JSON.stringify({ id: 1, email: "test@test.com", first_name: "Test", surname: "User" }));
        localStorage.setItem("applications", JSON.stringify([]));

        render(
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={
                            <AppContainer headerHeight={60}>
                                <div>Main Content</div>
                            </AppContainer>
                        } />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        );

        await vi.waitFor(() => {
            const header = document.querySelector('[class*="MuiBox-root"]');
            expect(header).toBeInTheDocument();
        });
    });

    it("devrait accepter une hauteur personnalisée", async () => {
        localStorage.setItem("token", "test-token");
        localStorage.setItem("user", JSON.stringify({ id: 1, email: "test@test.com", first_name: "Test", surname: "User" }));
        localStorage.setItem("applications", JSON.stringify([]));

        const { container } = render(
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={
                            <AppContainer headerHeight={80}>
                                <div>Content</div>
                            </AppContainer>
                        } />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        );

        await vi.waitFor(() => {
            const box = container.querySelector('[class*="css"]');
            expect(box).toBeInTheDocument();
        });
    });
});
