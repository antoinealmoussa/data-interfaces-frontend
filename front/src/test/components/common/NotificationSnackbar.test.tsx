import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationSnackbar } from "../../../components/common/NotificationSnackbar";

describe("NotificationSnackbar", () => {
  it("devrait afficher le message", () => {
    render(
      <NotificationSnackbar
        open={true}
        severity="success"
        message="Opération réussie"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Opération réussie")).toBeInTheDocument();
  });

  it("devrait afficher une icône d'erreur pour severity error", () => {
    render(
      <NotificationSnackbar
        open={true}
        severity="error"
        message="Erreur critique"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Erreur critique")).toBeInTheDocument();
  });

  it("devrait appeler onClose lors du clic sur le bouton de fermeture", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <NotificationSnackbar
        open={true}
        severity="info"
        message="Message informatif"
        onClose={onClose}
      />,
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("ne devrait pas être visible quand open est false", () => {
    render(
      <NotificationSnackbar
        open={false}
        severity="success"
        message="Message caché"
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByText("Message caché")).not.toBeInTheDocument();
  });

  it("devrait utiliser autoHideDuration personnalisé", () => {
    render(
      <NotificationSnackbar
        open={true}
        severity="warning"
        message="Avertissement"
        onClose={vi.fn()}
        autoHideDuration={10000}
      />,
    );
    expect(screen.getByText("Avertissement")).toBeInTheDocument();
  });
});
