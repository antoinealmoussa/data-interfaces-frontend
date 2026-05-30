import { useForm, Controller } from "react-hook-form";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";
import type { Player, CreatePlayerDto } from "../../../types/playerTypes";

interface PlayerFormProps {
  defaultValues?: Player;
  onSubmit: (data: CreatePlayerDto) => Promise<void>;
  onCancel: () => void;
  teamCategories: string[];
}

export const PlayerForm = ({ defaultValues, onSubmit, onCancel, teamCategories }: PlayerFormProps) => {
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
        {...register("name", {
          required: "Le nom est obligatoire",
          maxLength: { value: 100, message: "Max 100 caractères" },
        })}
        error={!!errors.name}
        helperText={errors.name?.message}
        fullWidth
      />

      <FormControl fullWidth error={!!errors.level}>
        <InputLabel>Niveau</InputLabel>
        <Controller
          name="level"
          control={control}
          rules={{ required: true, min: 1, max: 4 }}
          render={({ field }) => (
            <Select label="Niveau" {...field}>
              {[1, 2, 3, 4].map((n) => (
                <MenuItem key={n} value={n}>
                  Niveau {n}
                </MenuItem>
              ))}
            </Select>
          )}
        />
      </FormControl>

      <FormControl fullWidth error={!!errors.sex}>
        <InputLabel>Sexe</InputLabel>
        <Controller
          name="sex"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select label="Sexe" {...field}>
              <MenuItem value="H">Homme</MenuItem>
              <MenuItem value="F">Femme</MenuItem>
            </Select>
          )}
        />
      </FormControl>

      <FormControl fullWidth error={!!errors.position}>
        <InputLabel>Poste</InputLabel>
        <Controller
          name="position"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select label="Poste" {...field}>
              <MenuItem value="Ailier">Ailier</MenuItem>
              <MenuItem value="Meneur">Meneur</MenuItem>
            </Select>
          )}
        />
      </FormControl>

      <FormControl fullWidth error={!!errors.category_names}>
        <InputLabel>Catégories</InputLabel>
        <Controller
          name="category_names"
          control={control}
          rules={{ required: "Au moins une catégorie est requise" }}
          render={({ field }) => (
            <Select
              label="Catégories"
              multiple
              value={field.value}
              onChange={field.onChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((val) => (
                    <Chip key={val} label={val} size="small" />
                  ))}
                </Box>
              )}
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
