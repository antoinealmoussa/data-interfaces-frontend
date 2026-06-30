import { FormModal } from "../../common/FormModal";
import { PlayerForm } from "./PlayerForm";
import type { Player, CreatePlayerDto } from "../../../types/rugby-teams/playerTypes";

interface PlayerModalProps {
  open: boolean;
  mode: "create" | "edit";
  player?: Player | null;
  onSave: (data: CreatePlayerDto) => Promise<void>;
  onClose: () => void;
  teamCategories: string[];
}

export const PlayerModal = ({
  open,
  mode,
  player,
  onSave,
  onClose,
  teamCategories,
}: PlayerModalProps) => {
  return (
    <FormModal
      open={open}
      title={mode === "create" ? "Ajouter un joueur" : "Modifier le joueur"}
      onClose={onClose}
    >
      <PlayerForm
        defaultValues={player ?? undefined}
        onSubmit={onSave}
        onCancel={onClose}
        teamCategories={teamCategories}
      />
    </FormModal>
  );
};
