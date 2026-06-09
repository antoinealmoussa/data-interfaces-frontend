import { useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormLabel,
  Typography,
} from "@mui/material";
import type { Tournament, CreateTournamentDto } from "../../../types/tournamentTypes";

interface TournamentFormProps {
  defaultValues?: Tournament;
  onSubmit: (data: CreateTournamentDto) => Promise<void>;
  onCancel: () => void;
  teamCategories: string[];
  teamPlayers: { id: number; name: string; category_names: string[] }[];
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
        {...register("name", {
          required: "Le nom est obligatoire",
          maxLength: { value: 100, message: "Max 100 caractères" },
        })}
        error={!!errors.name}
        helperText={errors.name?.message}
        fullWidth
      />

      <FormControl fullWidth error={!!errors.category_name}>
        <InputLabel>Catégorie</InputLabel>
        <Controller
          name="category_name"
          control={control}
          rules={{ required: "La catégorie est obligatoire" }}
          render={({ field }) => (
            <Select
              label="Catégorie"
              {...field}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setValue("player_names", []);
                field.onChange(e);
              }}
            >
              {teamCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          )}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Joueurs</FormLabel>
        <Controller
          name="player_names"
          control={control}
          render={({ field }) => (
            <FormGroup>
              {filteredPlayers.map((player) => (
                <FormControlLabel
                  key={player.id}
                  control={
                    <Checkbox
                      checked={field.value.includes(player.name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          field.onChange([...field.value, player.name]);
                        } else {
                          field.onChange(field.value.filter((name) => name !== player.name));
                        }
                      }}
                    />
                  }
                  label={player.name}
                />
              ))}
            </FormGroup>
          )}
        />
      </FormControl>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
        <Button onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </Box>
    </Box>
  );
};
