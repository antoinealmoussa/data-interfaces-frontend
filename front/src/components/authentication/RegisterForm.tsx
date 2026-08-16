import { useActionState, useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../../api/client";
import { WVA_QUOTE_TEXT } from "../../utils/constants";
import { NotificationSnackbar } from "../common/NotificationSnackbar";
import { useSnackbar } from "../../hooks/useSnackbar";
import { registerSchema } from "../../utils/validationSchemas";
import { ApplicationSelection } from "../ui/ApplicationSelection";
import type { Application } from "../../types/authTypes";
import { API_PATHS } from "../../api/endpoints";

interface RegisterFieldErrors {
  first_name?: string;
  surname?: string;
  email?: string;
  password?: string;
}

interface RegisterActionState {
  errors: RegisterFieldErrors;
}

const initialRegisterState: RegisterActionState = { errors: {} };

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { snackbar, showSnackbar, handleCloseSnackbar } = useSnackbar();
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);

  const { data: applications = [] } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const response = await apiClient.get<Application[]>(API_PATHS.applications.base);
      return response.data;
    },
  });

  const [state, formAction, isSubmitting] = useActionState(
    async (
      _prev: RegisterActionState,
      formData: FormData,
    ): Promise<RegisterActionState> => {
      const result = registerSchema.safeParse({
        first_name: String(formData.get("first_name") ?? ""),
        surname: String(formData.get("surname") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });

      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        return {
          errors: {
            first_name: fieldErrors.first_name?.[0],
            surname: fieldErrors.surname?.[0],
            email: fieldErrors.email?.[0],
            password: fieldErrors.password?.[0],
          },
        };
      }

      try {
        await apiClient.post("/users/register", {
          ...result.data,
          applications: selectedApplications,
        });
        navigate("/login");
        return { errors: {} };
      } catch {
        showSnackbar("error", "Erreur lors de l'inscription");
        return { errors: {} };
      }
    },
    initialRegisterState,
  );

  return (
    <>
      <NotificationSnackbar
        open={snackbar.open}
        severity={snackbar.severity}
        message={snackbar.message}
        onClose={handleCloseSnackbar}
      />
      <Box
        component="form"
        action={formAction}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mt: 2,
        }}
      >
        <TextField
          variant="outlined"
          color="primary"
          label="Prénom"
          name="first_name"
          error={!!state.errors.first_name}
          helperText={state.errors.first_name}
        />

        <TextField
          variant="outlined"
          color="primary"
          label="Nom de famille"
          name="surname"
          error={!!state.errors.surname}
          helperText={state.errors.surname}
        />

        <TextField
          variant="outlined"
          color="primary"
          label="Email"
          name="email"
          error={!!state.errors.email}
          helperText={state.errors.email}
        />

        <TextField
          variant="outlined"
          color="primary"
          label="Mot de passe"
          type="password"
          name="password"
          error={!!state.errors.password}
          helperText={state.errors.password}
        />

        <ApplicationSelection
          applications={applications}
          value={selectedApplications}
          onChange={setSelectedApplications}
        />

        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Inscription..." : "S'inscrire"}
        </Button>

        <Typography key="caption" variant="subtitle2" color="primary">
          {WVA_QUOTE_TEXT}
        </Typography>
      </Box>
    </>
  );
};
