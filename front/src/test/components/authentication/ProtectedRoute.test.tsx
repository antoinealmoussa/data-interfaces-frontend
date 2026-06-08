import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { Routes, Route, MemoryRouter } from "react-router-dom";
import { ProtectedRoute } from "../../../components/authentication/ProtectedRoute";
import { AuthProvider } from "../../../contexts/AuthContext";

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn().mockRejectedValue(new Error("Default no auth")),
  mockPost: vi.fn().mockResolvedValue({ data: {} }),
}));

vi.mock("axios", () => ({
  default: {
    get: mockGet,
    post: mockPost,
    create: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
    defaults: { withCredentials: false },
  },
}));

import axios from "axios";
const mockedAxios = vi.mocked(axios, true);

vi.mock("../../../api/config", () => ({
  default: {
    backend: "http://localhost:8000/api/v1",
  },
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait rediriger vers /login si non authentifié", async () => {
    await act(async () => {
      render(
        <MemoryRouter initialEntries={["/"]}>
          <AuthProvider>
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
          </AuthProvider>
        </MemoryRouter>,
      );
    });

    await waitFor(() => {
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
