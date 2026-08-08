import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import { AccessRequestsManager } from "../../../components/ui/AccessRequestsManager";
const mockedAxios = vi.mocked(axios, true);

vi.mock("../../../api/config", () => ({
  default: {
    backend: "http://localhost:8000/api/v1",
  },
}));

const mockApplications = [
  { name: "rugby-teams", pretty_name: "Rugby Teams", description: "Gestion d'équipes de rugby" },
  { name: "bike-exploration", pretty_name: "Exploration vélo", description: "Sorties et explorations vélo" },
];

const mockRequest = {
  id: 1,
  status: "pending",
  created_at: "2026-01-01T00:00:00",
  user: {
    id: 2,
    email: "john.doe@example.com",
    first_name: "John",
    surname: "Doe",
  },
  applications: [
    { name: "rugby-teams", pretty_name: "Rugby Teams", description: "Gestion d'équipes de rugby" },
    { name: "bike-exploration", pretty_name: "Exploration vélo", description: "Sorties et explorations vélo" },
  ],
};

const renderManager = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AccessRequestsManager />
    </QueryClientProvider>,
  );
};

describe("AccessRequestsManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/applications")) {
        return Promise.resolve({ data: mockApplications });
      }
      return Promise.resolve({ data: [mockRequest] });
    });
    mockedAxios.put.mockResolvedValue({ data: {} });
  });

  it("devrait afficher les demandes en attente avec les infos utilisateur", async () => {
    renderManager();

    await waitFor(() => {
      expect(screen.getByText(/John Doe — john.doe@example.com/)).toBeInTheDocument();
    });

    expect(
      screen.getByRole("checkbox", { name: /gestion d'équipes de rugby/i }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: /sorties et explorations vélo/i }),
    ).toBeChecked();
    expect(
      screen.getByRole("button", { name: /approuver/i }),
    ).toBeInTheDocument();
  });

  it("devrait afficher un message quand il n'y a aucune demande", async () => {
    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes("/applications")) {
        return Promise.resolve({ data: mockApplications });
      }
      return Promise.resolve({ data: [] });
    });

    renderManager();

    await waitFor(() => {
      expect(screen.getByText(/aucune demande en attente/i)).toBeInTheDocument();
    });
  });

  it("devrait approuver avec la sélection demandée", async () => {
    const user = userEvent.setup();
    renderManager();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /approuver/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /approuver/i }));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "/application-access-requests/1",
        { applications: ["rugby-teams", "bike-exploration"] },
      );
    });
  });

  it("devrait approuver avec une sélection modifiée par l'admin", async () => {
    const user = userEvent.setup();
    renderManager();

    await waitFor(() => {
      expect(
        screen.getByRole("checkbox", { name: /gestion d'équipes de rugby/i }),
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("checkbox", { name: /gestion d'équipes de rugby/i }),
    );
    await user.click(screen.getByRole("button", { name: /approuver/i }));

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "/application-access-requests/1",
        { applications: ["bike-exploration"] },
      );
    });
  });

  it("devrait afficher un message de succès après approbation", async () => {
    const user = userEvent.setup();
    renderManager();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /approuver/i }),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /approuver/i }));

    await waitFor(() => {
      expect(screen.getByText(/demande approuvée/i)).toBeInTheDocument();
    });
  });
});
