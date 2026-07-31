import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlayerModal } from "../../../../components/rugby-teams/player/PlayerModal";

vi.mock("../../../../components/rugby-teams/player/PlayerForm", () => ({
  PlayerForm: ({
    defaultValues,
    onCancel,
  }: {
    defaultValues?: unknown;
    onCancel: () => void;
  }) => (
    <div data-testid="player-form">
      <span>{defaultValues ? "mode-edit" : "mode-create"}</span>
      <button onClick={onCancel}>cancel-form</button>
    </div>
  ),
}));

describe("PlayerModal", () => {
  const mockSave = vi.fn();
  const mockClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait afficher le titre en mode création", () => {
    render(
      <PlayerModal
        open
        mode="create"
        onSave={mockSave}
        onClose={mockClose}
        teamCategories={["Mixte", "+35"]}
      />,
    );

    expect(screen.getByText("Ajouter un joueur")).toBeInTheDocument();
    expect(screen.getByText("mode-create")).toBeInTheDocument();
  });

  it("devrait afficher le titre en mode édition", () => {
    render(
      <PlayerModal
        open
        mode="edit"
        player={{
          id: 1,
          name: "Jean",
          level: 2,
          sex: "H",
          position: "Ailier",
          team_name: "Mon equipe",
          category_names: ["Mixte"],
        }}
        onSave={mockSave}
        onClose={mockClose}
        teamCategories={["Mixte", "+35"]}
      />,
    );

    expect(screen.getByText("Modifier le joueur")).toBeInTheDocument();
    expect(screen.getByText("mode-edit")).toBeInTheDocument();
  });

  it("devrait ne pas afficher le dialogue quand open est false", () => {
    render(
      <PlayerModal
        open={false}
        mode="create"
        onSave={mockSave}
        onClose={mockClose}
        teamCategories={["Mixte", "+35"]}
      />,
    );

    expect(screen.queryByText("Ajouter un joueur")).not.toBeInTheDocument();
  });

  it("devrait fermer le modal via le formulaire", async () => {
    const user = userEvent.setup();
    render(
      <PlayerModal
        open
        mode="create"
        onSave={mockSave}
        onClose={mockClose}
        teamCategories={["Mixte", "+35"]}
      />,
    );

    await user.click(screen.getByText("cancel-form"));

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
