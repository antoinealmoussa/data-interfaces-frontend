import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import RacePreparation from "../../../pages/race-preparation/RacePreparation";

vi.mock("../../../api/client", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const renderPage = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RacePreparation />
      </BrowserRouter>
    </QueryClientProvider>,
  );

describe("RacePreparation", () => {
  it("devrait afficher le titre de la page", () => {
    renderPage();
    expect(screen.getByText("Préparation de course")).toBeInTheDocument();
  });
});
