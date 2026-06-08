import { Dialog, DialogTitle, DialogContent } from "@mui/material";
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === "create" ? "Ajouter un tournoi" : "Modifier le tournoi"}
      </DialogTitle>
      <DialogContent>
        <TournamentForm
          defaultValues={tournament ?? undefined}
          onSubmit={onSave}
          onCancel={onClose}
          teamCategories={teamCategories}
          teamPlayers={teamPlayers}
        />
      </DialogContent>
    </Dialog>
  );
};
