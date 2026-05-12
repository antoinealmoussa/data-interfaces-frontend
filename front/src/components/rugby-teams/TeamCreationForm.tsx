import {
  Box,
  Button,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Typography,
} from "@mui/material";
import { useState, useMemo } from "react";
import { teamApi } from "../../api/teamApi";
import {
  type CreateTeamDto,
  TEAM_CATEGORIES,
  type TeamCategory,
  type Team,
} from "../../types/teamTypes";
import { useNavigate } from "react-router-dom";

interface TeamCreationFormProps {
  userId: number;
  onSuccess?: (team: Team) => void;
}

export const TeamCreationForm = ({
  userId,
  onSuccess,
}: TeamCreationFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateTeamDto>({
    name: "",
    categories: [],
    user_id: userId,
    season_name: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validation = useMemo(() => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Le nom de l'équipe est obligatoire";
    } else if (formData.name.length > 50) {
      errors.name = "Le nom ne doit pas dépasser 50 caractères";
    }

    if (!formData.season_name) {
      errors.season = "Veuillez saisir une saison.";
    }

    if (formData.categories.length === 0) {
      errors.categories = "Veuillez sélectionner au moins une catégorie.";
    }

    return {
      errors,
      isFormValid: Object.keys(errors).length === 0,
    };
  }, [formData]);

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category as TeamCategory]
        : prev.categories.filter((c) => c !== category),
    }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!validation.isFormValid) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await teamApi.create(formData);
      const team = response.data;
      navigate(`/rugby-teams/${team.id}/${team.seasons[0].id}/team-management`, {
        state: { teamCreated: true },
      });
    } catch (error: any) {
      setSubmitError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
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
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <TextField
          label="Nom de l'équipe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          error={submitted && !!validation.errors.name}
          helperText={submitted && validation.errors.name ? validation.errors.name : `${formData.name.length}/50 caractères`}
          inputProps={{ maxLength: 50 }}
          fullWidth
        />

        <TextField
          label="Saison (ex: 2025-2026)"
          value={formData.season_name}
          onChange={(e) => setFormData({ ...formData, season_name: e.target.value })}
          required
          error={submitted && !!validation.errors.season}
          helperText={submitted && validation.errors.season ? validation.errors.season : " "}
          placeholder="Saisissez une saison"
          fullWidth
        />

        <FormControl error={submitted && !!validation.errors.categories} required>
          <FormLabel>Catégories jouées</FormLabel>
          <FormGroup>
            {TEAM_CATEGORIES.map((category) => (
              <FormControlLabel
                key={category}
                control={
                  <Checkbox
                    checked={formData.categories.includes(category)}
                    onChange={(e) =>
                      handleCategoryChange(category, e.target.checked)
                    }
                  />
                }
                label={category}
              />
            ))}
          </FormGroup>
          {submitted && validation.errors.categories && (
            <Typography variant="caption" color="error">
              {validation.errors.categories}
            </Typography>
          )}
        </FormControl>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!validation.isFormValid || isSubmitting}
          size="large"
          sx={{ mt: 2 }}
        >
          {isSubmitting ? "Création en cours..." : "Créer l'équipe"}
        </Button>
      </Box>

    </Box>
  );
};
