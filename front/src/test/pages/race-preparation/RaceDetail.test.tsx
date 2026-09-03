import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import RaceDetail from "../../../pages/race-preparation/RaceDetail";
import apiClient from "../../../api/client";

const race = {
  id: 42,
  name: "Trail du Mont Blanc",
  file_name: "trail.gpx",
  user_id: 1,
  gpx_file_path: "/uploads/1/42.gpx",
  total_distance: 170000,
  total_elevation_gain: 10000,
  total_elevation_loss: 9900,
  sections: [],
  created_at: "2026-01-01T00:00:00",
  updated_at: "2026-01-01T00:00:00",
};

vi.mock("../../../api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderPage = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/race-preparation/42"]}>
        <Routes>
          <Route path="/race-preparation" element={<Outlet />}>
            <Route path=":raceId" element={<RaceDetail />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

describe("RaceDetail", () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
    queryClient.clear();
  });

  it("devrait afficher le nom de la course de l'URL", async () => {
    vi.mocked(apiClient.get).mockImplementation((url: unknown) => {
      const path = String(url);
      if (path.includes("/track-points")) {
        return Promise.resolve({ data: { track_points: [] } }) as never;
      }
      return Promise.resolve({ data: race }) as never;
    });

    renderPage();

    expect(
      await screen.findByText("Trail du Mont Blanc"),
    ).toBeInTheDocument();
  });
});
