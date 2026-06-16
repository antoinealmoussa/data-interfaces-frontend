import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "../../../components/common/ConfirmDialog";

describe("ConfirmDialog", () => {
  it("devrait afficher le titre et le message", () => {
    render(
      <ConfirmDialog
        open={true}
        title="Supprimer l'élément"
        message="Êtes-vous sûr ?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Supprimer l'élément")).toBeInTheDocument();
    expect(screen.getByText("Êtes-vous sûr ?")).toBeInTheDocument();
  });

  it("devrait afficher les labels par défaut", () => {
    render(
      <ConfirmDialog
        open={true}
        title="Titre"
        message="Message"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Confirmer")).toBeInTheDocument();
    expect(screen.getByText("Annuler")).toBeInTheDocument();
  });

  it("devrait utiliser les labels personnalisés", () => {
    render(
      <ConfirmDialog
        open={true}
        title="Titre"
        message="Message"
        confirmLabel="Oui"
        cancelLabel="Non"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Oui")).toBeInTheDocument();
    expect(screen.getByText("Non")).toBeInTheDocument();
  });

  it("devrait appeler onConfirm au clic sur Confirmer", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        open={true}
        title="Titre"
        message="Message"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    await user.click(screen.getByText("Confirmer"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("devrait appeler onCancel au clic sur Annuler", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        open={true}
        title="Titre"
        message="Message"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByText("Annuler"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("devrait désactiver les boutons pendant le chargement", () => {
    render(
      <ConfirmDialog
        open={true}
        title="Titre"
        message="Message"
        loading={true}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Annuler")).toBeDisabled();
    expect(screen.getByText("Confirmer...")).toBeDisabled();
  });

  it("ne devrait pas être visible quand open est false", () => {
    render(
      <ConfirmDialog
        open={false}
        title="Titre"
        message="Message"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.queryByText("Titre")).not.toBeInTheDocument();
  });
});
