import { useForm } from "react-hook-form";
import { Box, TextField } from "@mui/material";
import type { Player, CreatePlayerDto } from "../../../types/rugby-teams/playerTypes";
import { FormActions } from "../../common/FormActions";
import { ControlledSelect } from "../../ui/ControlledSelect";
import { CheckboxGroupField } from "../../ui/CheckboxGroupField";
import { nameValidators } from "../../../utils/validators";

interface PlayerFormProps {
  defaultValues?: Player;
  onSubmit: (data: CreatePlayerDto) => Promise<void>;
  onCancel: () => void;
  teamCategories: string[];
}

const LEVEL_OPTIONS = [1, 2, 3, 4].map((n) => ({
  value: n,
  label: `Niveau ${n}`,
}));

const SEX_OPTIONS = [
  { value: "H", label: "Homme" },
  { value: "F", label: "Femme" },
];

const POSITION_OPTIONS = [
  { value: "Ailier", label: "Ailier" },
  { value: "Meneur", label: "Meneur" },
];

export const PlayerForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  teamCategories,
}: PlayerFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreatePlayerDto>({
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          level: defaultValues.level,
          sex: defaultValues.sex,
          position: defaultValues.position,
          category_names: defaultValues.category_names,
        }
      : {
          name: "",
          level: 1,
          sex: "H",
          position: "Ailier",
          category_names: [],
        },
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <TextField
        label="Nom"
        {...register("name", nameValidators)}
        error={!!errors.name}
        helperText={errors.name?.message}
        fullWidth
      />

      <ControlledSelect
        name="level"
        control={control}
        label="Niveau"
        options={LEVEL_OPTIONS}
        rules={{ required: true, min: 1, max: 4 }}
      />

      <ControlledSelect
        name="sex"
        control={control}
        label="Sexe"
        options={SEX_OPTIONS}
        rules={{ required: true }}
      />

      <ControlledSelect
        name="position"
        control={control}
        label="Poste"
        options={POSITION_OPTIONS}
        rules={{ required: true }}
      />

      <CheckboxGroupField
        name="category_names"
        control={control}
        label="Catégories"
        options={teamCategories}
        required
        rules={{ required: "Au moins une catégorie est requise" }}
      />

      <FormActions onCancel={onCancel} isSubmitting={isSubmitting} />
    </Box>
  );
};
