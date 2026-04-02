import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLogout } from "../../hooks/useLogout";
import { AuthProvider } from "../../contexts/AuthContext";
import { BrowserRouter } from "react-router-dom";
import React, { useState } from "react";
import axios from "axios";

vi.mock("axios");
const mockedAxios = vi.mocked(axios, true);

vi.mock("../../api/config", () => ({
    default: {
        backend: "http://localhost:8000/api/v1",
    },
}));

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <BrowserRouter>
            <AuthProvider>
                {children}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe("useLogout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("devrait retourner une fonction de logout", () => {
        const { result } = renderHook(() => useLogout(), {
            wrapper: AllTheProviders,
        });

        expect(typeof result.current).toBe("function");
    });

    it("devrait être une fonction qui peut être appelée", async () => {
        mockedAxios.post.mockResolvedValueOnce({
            data: { message: "Logged out" },
        });

        const TestComponent: React.FC = () => {
            const logout = useLogout();
            const [called, setCalled] = useState(false);
            
            const handleClick = async () => {
                await logout();
                setCalled(true);
            };
            
            return (
                <button onClick={handleClick} data-testid="logout-btn">
                    {called ? "Logged out" : "Not called"}
                </button>
            );
        };

        const { container } = render(
            <BrowserRouter>
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            </BrowserRouter>
        );

        const user = userEvent.setup();
        await user.click(container.querySelector("button")!);

        await vi.waitFor(() => {
            expect(mockedAxios.post).toHaveBeenCalled();
        });
    });
});
