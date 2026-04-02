import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { LogoutPage } from "../../../pages/authentication/LogoutPage";
import { AuthProvider } from "../../../contexts/AuthContext";
import axios from "axios";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

vi.mock("../../../api/config", () => ({
    default: {
        backend: "http://localhost:8000/api/v1",
    },
}));

describe("LogoutPage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("devrait rediriger vers la page de login", async () => {
        mockedAxios.post.mockResolvedValueOnce({
            data: { message: "Logged out" },
        });

        render(
            <MemoryRouter initialEntries={["/logout"]}>
                <AuthProvider>
                    <Routes>
                        <Route path="/logout" element={<LogoutPage />} />
                        <Route path="/login" element={<div>Login Page</div>} />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Login Page")).toBeInTheDocument();
        });
    });
});
