import {
  Box,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { teamApi } from "../../api/rugby-teams/teamApi";
import { type CreateTeamDto, TEAM_CATEGORIES } from "../../types/rugby-teams/teamTypes";
import { FormActions } from "../common/FormActions";
import { useNavigate } from "react-router-dom";
import { toggleArrayItem } from "../../utils/array";

interface TeamCreationFormProps {
  userId: number;
}

export const TeamCreationForm = ({ userId }: TeamCreationFormProps) => {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeamDto>({
    defaultValues: {
      name: "",
      categories: [],
      user_id: userId,
      season_name: "",
    },
  });

  const nameValue = useWatch({ control, name: "name" });

  const onSubmit = async (data: CreateTeamDto) => {
    setSubmitError(null);
    try {
      const team = await teamApi.create(data);
      navigate(
        `/rugby-teams/${encodeURIComponent(team.name)}/${encodeURIComponent(team.seasons[0].name)}/team-management`,
        { state: { teamCreated: true } },
      );
    } catch {
      setSubmitError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Créer une équipe
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Remplissez les informations pour créer une nouvelle équipe.
      </Typography>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <TextField
          label="Nom de l'équipe"
          {...register("name", {
            required: "Le nom de l'équipe est obligatoire",
            maxLength: {
              value: 50,
              message: "Le nom ne doit pas dépasser 50 caractères",
            },
          })}
          error={!!errors.name}
          helperText={
            errors.name
              ? errors.name.message
              : `${nameValue.length}/50 caractères`
          }
          slotProps={{ htmlInput: { maxLength: 50 } }}
          fullWidth
        />

        <TextField
          label="Saison (ex: 2025-2026)"
          {...register("season_name", {
            required: "Veuillez saisir une saison.",
          })}
          error={!!errors.season_name}
          helperText={errors.season_name?.message}
          placeholder="Saisissez une saison"
          fullWidth
        />

        <Controller
          control={control}
          name="categories"
          rules={{
            validate: (value) =>
              value.length > 0 ||
              "Veuillez sélectionner au moins une catégorie.",
          }}
          render={({ field, fieldState }) => (
            <FormControl error={!!fieldState.error} required>
              <FormLabel>Catégories jouées</FormLabel>
              <FormGroup>
                {TEAM_CATEGORIES.map((category) => (
                  <FormControlLabel
                    key={category}
                    control={
                      <Checkbox
                        checked={field.value.includes(category)}
                        onChange={() =>
                          field.onChange(toggleArrayItem(field.value, category))
                        }
                      />
                    }
                    label={category}
                  />
                ))}
              </FormGroup>
              {fieldState.error && (
                <Typography variant="caption" color="error">
                  {fieldState.error.message}
                </Typography>
              )}
            </FormControl>
          )}
        />

        <FormActions
          onCancel={() => navigate("/")}
          isSubmitting={isSubmitting}
          submitLabel="Créer l'équipe"
        />
      </Box>
    </Box>
  );
};
