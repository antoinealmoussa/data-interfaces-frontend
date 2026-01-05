import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProtectedRoute } from "../../../components/authentication/ProtectedRoute";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../../../contexts/AuthContext";
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { LoginForm } from "../../../components/authentication/LoginForm";

const MockDashboard = () => <div>Contenu protégé</div>

const server = setupServer(
    http.post('*/users/login', () => {
        return HttpResponse.json({
            email: "test@mail.com", first_name: "Test", surname: "test"
        }, { status: 200 })
    })
);

describe("ProtectedRoute", () => {
    beforeAll(() => server.listen());
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());
    it("devrait rediriger vers login si non authentifié", () => {
        render(
            <MemoryRouter initialEntries={["/"]}>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<LoginForm />} />
                        <Route path="/" element={<ProtectedRoute><MockDashboard /></ProtectedRoute>} />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument();
    });

    it("devrait rediriger vers le dashboard après authentification", async () => {
        const user = userEvent.setup();
        render(
            <MemoryRouter initialEntries={["/"]}>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<LoginForm />} />
                        <Route path="/" element={<ProtectedRoute><MockDashboard /></ProtectedRoute>} />
                    </Routes>
                </AuthProvider>
            </MemoryRouter>
        );

        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/mot de passe/i);
        const submitButton = screen.getByRole("button", { name: /se connecter/i });

        await user.type(emailInput, "test@example.com");
        await user.type(passwordInput, "password123");
        await user.click(submitButton);

        const successContent = await screen.findByText("Contenu protégé");
        expect(successContent).toBeInTheDocument();

    })
});

