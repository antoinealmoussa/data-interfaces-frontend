import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TournamentModal } from "../../../../components/rugby-teams/tournament/TournamentModal";

vi.mock("../../../../components/rugby-teams/tournament/TournamentForm", () => ({
  TournamentForm: ({
    defaultValues,
    onCancel,
  }: {
    defaultValues?: unknown;
    onCancel: () => void;
  }) => (
    <div data-testid="tournament-form">
      <span>{defaultValues ? "mode-edit" : "mode-create"}</span>
      <button onClick={onCancel}>cancel-form</button>
    </div>
  ),
}));

describe("TournamentModal", () => {
  const mockSave = vi.fn();
  const mockClose = vi.fn();
  const teamPlayers = [{ id: 1, name: "Jean", category_names: ["Mixte"] }];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait afficher le titre en mode création", () => {
    render(
      <TournamentModal
        open
        mode="create"
        onSave={mockSave}
        onClose={mockClose}
        teamCategories={["Mixte", "+35"]}
        teamPlayers={teamPlayers}
      />,
    );

    expect(screen.getByText("Ajouter un tournoi")).toBeInTheDocument();
    expect(screen.getByText("mode-create")).toBeInTheDocument();
  });

  it("devrait afficher le titre en mode édition", () => {
    render(
      <TournamentModal
        open
        mode="edit"
        tournament={{ id: 1, name: "Tournoi", category_name: "Mixte", player_names: ["Jean"] }}
        onSave={mockSave}
        onClose={mockClose}
        teamCategories={["Mixte", "+35"]}
        teamPlayers={teamPlayers}
      />,
    );

    expect(screen.getByText("Modifier le tournoi")).toBeInTheDocument();
    expect(screen.getByText("mode-edit")).toBeInTheDocument();
  });

  it("devrait ne pas afficher le dialogue quand open est false", () => {
    render(
      <TournamentModal
        open={false}
        mode="create"
        onSave={mockSave}
        onClose={mockClose}
        teamCategories={["Mixte", "+35"]}
        teamPlayers={teamPlayers}
      />,
    );

    expect(screen.queryByText("Ajouter un tournoi")).not.toBeInTheDocument();
  });

  it("devrait fermer le modal via le formulaire", async () => {
    const user = userEvent.setup();
    render(
      <TournamentModal
        open
        mode="create"
        onSave={mockSave}
        onClose={mockClose}
        teamCategories={["Mixte", "+35"]}
        teamPlayers={teamPlayers}
      />,
    );

    await user.click(screen.getByText("cancel-form"));

    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
