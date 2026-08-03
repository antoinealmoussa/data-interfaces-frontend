import { Box, TextField, Alert, Typography } from "@mui/material";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { teamApi } from "../../api/rugby-teams/teamApi";
import { type CreateTeamDto, type Team, TEAM_CATEGORIES } from "../../types/rugby-teams/teamTypes";
import { FormActions } from "../common/FormActions";
import { CheckboxGroupField } from "../ui/CheckboxGroupField";
import { useNavigate } from "react-router-dom";

export const TeamCreationForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
      season_name: "",
    },
  });

  const nameValue = useWatch({ control, name: "name" });

  const onSubmit = async (data: CreateTeamDto) => {
    setSubmitError(null);
    try {
      const team = await teamApi.create(data);
      queryClient.setQueryData<Team[]>(["teams"], (old = []) => [
        ...old,
        team,
      ]);
      navigate(
        `/rugby-teams/${encodeURIComponent(team.name)}/${encodeURIComponent(team.seasons[0].name)}/team-management`,
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

        <CheckboxGroupField
          name="categories"
          control={control}
          label="Catégories jouées"
          options={[...TEAM_CATEGORIES]}
          required
          rules={{
            validate: (value) =>
              (value as string[]).length > 0 ||
              "Veuillez sélectionner au moins une catégorie.",
          }}
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
