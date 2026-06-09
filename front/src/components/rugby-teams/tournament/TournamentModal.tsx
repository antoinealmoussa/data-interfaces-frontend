import { FormModal } from "../../common/FormModal";
import { TournamentForm } from "./TournamentForm";
import type { Tournament, CreateTournamentDto } from "../../../types/tournamentTypes";

interface TournamentModalProps {
  open: boolean;
  mode: "create" | "edit";
  tournament?: Tournament | null;
  onSave: (data: CreateTournamentDto) => Promise<void>;
  onClose: () => void;
  teamCategories: string[];
  teamPlayers: { id: number; name: string; category_names: string[] }[];
}

export const TournamentModal = ({
  open,
  mode,
  tournament,
  onSave,
  onClose,
  teamCategories,
  teamPlayers,
}: TournamentModalProps) => {
  return (
    <FormModal
      open={open}
      title={mode === "create" ? "Ajouter un tournoi" : "Modifier le tournoi"}
      onClose={onClose}
    >
      <TournamentForm
        defaultValues={tournament ?? undefined}
        onSubmit={onSave}
        onCancel={onClose}
        teamCategories={teamCategories}
        teamPlayers={teamPlayers}
      />
    </FormModal>
  );
};
