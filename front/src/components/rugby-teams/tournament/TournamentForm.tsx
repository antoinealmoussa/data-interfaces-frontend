import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Box, TextField } from "@mui/material";
import { FormActions } from "../../common/FormActions";
import { ControlledSelect } from "../../ui/ControlledSelect";
import { CheckboxGroupField } from "../../ui/CheckboxGroupField";
import { nameValidators } from "../../../utils/validators";
import type {
  Tournament,
  CreateTournamentDto,
} from "../../../types/rugby-teams/tournamentTypes";
import type { PlayerSimple } from "../../../types/rugby-teams/playerTypes";

interface TournamentFormProps {
  defaultValues?: Tournament;
  onSubmit: (data: CreateTournamentDto) => Promise<void>;
  onCancel: () => void;
  teamCategories: string[];
  teamPlayers: PlayerSimple[];
}

export const TournamentForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  teamCategories,
  teamPlayers,
}: TournamentFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTournamentDto>({
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          category_name: defaultValues.category_name,
          player_names: defaultValues.player_names,
        }
      : {
          name: "",
          category_name: "",
          player_names: [],
        },
  });

  const [selectedCategory, setSelectedCategory] = useState("");

  const filteredPlayers = useMemo(
    () =>
      (selectedCategory
        ? teamPlayers.filter((p) => p.category_names.includes(selectedCategory))
        : []
      ).sort((a, b) => a.name.localeCompare(b.name)),
    [selectedCategory, teamPlayers],
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
    >
      <TextField
        label="Nom"
        {...register("name", nameValidators)}
        error={!!errors.name}
        helperText={errors.name?.message}
        fullWidth
      />

      <ControlledSelect
        name="category_name"
        control={control}
        label="Catégorie"
        options={teamCategories.map((cat) => ({ value: cat, label: cat }))}
        rules={{ required: "La catégorie est obligatoire" }}
        onChange={(value) => {
          setSelectedCategory(value);
          setValue("player_names", []);
        }}
      />

      <CheckboxGroupField
        name="player_names"
        control={control}
        label="Joueurs"
        options={filteredPlayers.map((player) => player.name)}
      />

      <FormActions onCancel={onCancel} isSubmitting={isSubmitting} />
    </Box>
  );
};
