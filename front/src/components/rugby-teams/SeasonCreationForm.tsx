import {
  Box,
  TextField,
  Alert,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTeamAndSeason } from "../../hooks/rugby-teams/useTeamAndSeason";
import { playerApi } from "../../api/rugby-teams/playerApi";
import { seasonApi } from "../../api/rugby-teams/seasonApi";
import type { CreateSeasonDto } from "../../types/rugby-teams/seasonTypes";
import type { Team } from "../../types/rugby-teams/teamTypes";
import { FormActions } from "../common/FormActions";
import { PageGuard } from "../common/PageGuard";

function nextSeasonName(currentName: string): string {
  const match = currentName.match(/^(\d{4})-(\d{4})$/);
  if (!match) return "";
  const endYear = parseInt(match[2], 10) + 1;
  return `${match[2]}-${String(endYear).padStart(4, "0")}`;
}

const SEASON_RE = /^\d{4}-\d{4}$/;

const SeasonCreationForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { team, season, loading, error } = useTeamAndSeason();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const playersInitialized = useRef(false);

  const suggestedName = season ? nextSeasonName(season.name) : "";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateSeasonDto>({
    defaultValues: {
      name: suggestedName,
      player_ids: [],
    },
  });

  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ["players", team?.name, season?.id],
    queryFn: () =>
      playerApi.getByTeam(team!.name, season!.id).then((data) =>
        data.sort((a, b) => a.name.localeCompare(b.name)),
      ),
    enabled: !!team && !!season,
  });

  useEffect(() => {
    if (!playersInitialized.current && players.length > 0) {
      playersInitialized.current = true;
      setSelectedPlayerIds(players.map((p) => p.id));
    }
  }, [players]);

  const createSeasonMutation = useMutation({
    mutationFn: (data: CreateSeasonDto) => seasonApi.createForTeam(team!.name, data),
    onSuccess: (updatedTeam, variables) => {
      queryClient.setQueryData<Team[]>(["teams"], (old = []) =>
        old.map((t) => (t.id === updatedTeam.id ? updatedTeam : t)),
      );
      navigate(
        `/rugby-teams/${encodeURIComponent(updatedTeam.name)}/${encodeURIComponent(variables.name)}/team-management`,
      );
    },
  });

  const onSubmit = async (data: CreateSeasonDto) => {
    setSubmitError(null);
    try {
      await createSeasonMutation.mutateAsync({
        name: data.name,
        player_ids: selectedPlayerIds,
      });
    } catch {
      setSubmitError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  const togglePlayer = (playerId: number) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
  };

  const toggleAll = () => {
    setSelectedPlayerIds((prev) =>
      prev.length === players.length ? [] : players.map((p) => p.id),
    );
  };

  return (
    <PageGuard
      loading={loading || playersLoading}
      error={error || (!team || !season ? "Équipe ou saison introuvable" : null)}
    >
      <Box sx={{ maxWidth: 600, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Nouvelle saison pour « {team?.name} »
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Sélectionnez les joueurs de l'effectif actuel à conserver dans la
          nouvelle saison.
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
            label="Nom de la saison (AAAA-AAAA)"
            {...register("name", {
              required: "Le nom de la saison est obligatoire",
              pattern: {
                value: SEASON_RE,
                message: "Format invalide, utilisez AAAA-AAAA (ex : 2026-2027)",
              },
            })}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
          />

          <Box>
            <FormLabel component="legend">
              Joueurs à conserver ({selectedPlayerIds.length}/{players.length})
            </FormLabel>
            <FormGroup sx={{ mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      players.length > 0 &&
                      selectedPlayerIds.length === players.length
                    }
                    indeterminate={
                      selectedPlayerIds.length > 0 &&
                      selectedPlayerIds.length < players.length
                    }
                    onChange={toggleAll}
                  />
                }
                label="Tout sélectionner"
              />
              {players.map((player) => (
                <FormControlLabel
                  key={player.id}
                  control={
                    <Checkbox
                      checked={selectedPlayerIds.includes(player.id)}
                      onChange={() => togglePlayer(player.id)}
                    />
                  }
                  label={player.name}
                />
              ))}
            </FormGroup>
          </Box>

          <FormActions
            onCancel={() => navigate(-1)}
            isSubmitting={isSubmitting || createSeasonMutation.isPending}
            submitLabel="Créer la saison"
          />
        </Box>
      </Box>
    </PageGuard>
  );
};

export { SeasonCreationForm };