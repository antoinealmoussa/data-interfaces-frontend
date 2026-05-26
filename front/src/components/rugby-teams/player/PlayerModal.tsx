import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { PlayerForm } from "./PlayerForm";
import type { Player, CreatePlayerDto } from "../../../types/playerTypes";

interface PlayerModalProps {
  open: boolean;
  mode: "create" | "edit";
  player?: Player | null;
  onSave: (data: CreatePlayerDto) => Promise<void>;
  onClose: () => void;
}

export const PlayerModal = ({
  open,
  mode,
  player,
  onSave,
  onClose,
}: PlayerModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === "create" ? "Ajouter un joueur" : "Modifier le joueur"}
      </DialogTitle>
      <DialogContent>
        <PlayerForm
          defaultValues={player ?? undefined}
          onSubmit={onSave}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};
