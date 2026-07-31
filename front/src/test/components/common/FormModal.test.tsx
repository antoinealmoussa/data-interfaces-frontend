import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormModal } from "../../../components/common/FormModal";

describe("FormModal", () => {
  it("devrait afficher le titre et le contenu quand open est true", () => {
    render(
      <FormModal open title="Titre du modal" onClose={vi.fn()}>
        <div>Contenu du modal</div>
      </FormModal>,
    );

    expect(screen.getByText("Titre du modal")).toBeInTheDocument();
    expect(screen.getByText("Contenu du modal")).toBeInTheDocument();
  });

  it("devrait ne rien afficher quand open est false", () => {
    render(
      <FormModal open={false} title="Titre du modal" onClose={vi.fn()}>
        <div>Contenu du modal</div>
      </FormModal>,
    );

    expect(screen.queryByText("Titre du modal")).not.toBeInTheDocument();
    expect(screen.queryByText("Contenu du modal")).not.toBeInTheDocument();
  });

  it("devrait appeler onClose avec la touche Echap", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <FormModal open title="Titre du modal" onClose={onClose}>
        <div>Contenu du modal</div>
      </FormModal>,
    );

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalled();
  });
});
