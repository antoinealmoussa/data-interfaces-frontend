import { useActionState } from "react";
import { TextField, Button, Box, Typography, Divider } from "@mui/material";
import { Link as BaseLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/client";
import { useAuth } from "../../hooks/useAuth";
import { NotificationSnackbar } from "../common/NotificationSnackbar";
import { WVA_QUOTE_TEXT } from "../../utils/constants";
import { useSnackbar } from "../../hooks/useSnackbar";

interface LoginActionState {
  error: boolean;
}

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { snackbar, showSnackbar, handleCloseSnackbar } = useSnackbar();

  const [, formAction, isSubmitting] = useActionState(
    async (_prev: LoginActionState, formData: FormData) => {
      try {
        const params = new URLSearchParams();
        params.append("username", String(formData.get("email") ?? ""));
        params.append("password", String(formData.get("password") ?? ""));
        await apiClient.post("/users/login", params);

        await login();
        navigate("/");
        return { error: false };
      } catch {
        showSnackbar("error", "Erreur lors de la connexion");
        return { error: true };
      }
    },
    { error: false } satisfies LoginActionState,
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
          label="Email"
          name="email"
        />

        <TextField
          variant="outlined"
          color="primary"
          label="Mot de passe"
          type="password"
          name="password"
        />

        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Connexion..." : "Se connecter"}
        </Button>

        <Divider sx={{ my: 1 }}>OU</Divider>

        <Button
          variant="contained"
          color="secondary"
          component={BaseLink}
          to="/register"
        >
          S'inscrire
        </Button>
        <Typography variant="subtitle2" color="primary">
          {WVA_QUOTE_TEXT}
        </Typography>
      </Box>
    </>
  );
};
