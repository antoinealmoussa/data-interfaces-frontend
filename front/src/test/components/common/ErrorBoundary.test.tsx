import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "../../../components/common/ErrorBoundary";

const ThrowingChild = () => {
  throw new Error("boom");
};

describe("ErrorBoundary", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, reload: reloadMock },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
    vi.restoreAllMocks();
  });

  it("devrait afficher les enfants quand aucune erreur ne survient", () => {
    render(
      <ErrorBoundary>
        <div>Contenu normal</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Contenu normal")).toBeInTheDocument();
  });

  it("devrait afficher le message d'erreur quand un enfant lève une exception", () => {
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Une erreur est survenue")).toBeInTheDocument();
    expect(screen.getByText("boom")).toBeInTheDocument();
    expect(screen.getByText("Recharger la page")).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it("devrait recharger la page au clic sur le bouton", async () => {
    const user = userEvent.setup();
    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    await user.click(screen.getByText("Recharger la page"));

    expect(window.location.reload).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
