import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link as BaseLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { type LoginFormProps } from "../../types/authTypes";
import apiClient from "../../api/client";
import { useAuth } from "../../hooks/useAuth";

export const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormProps>();

  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorSnackbar, setErrorSnackbar] = useState(false);

  const onSubmit = async (data: LoginFormProps) => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", data.email);
      formData.append("password", data.password);
      await apiClient.post("/users/login", formData);

      await login();
      navigate("/");
    } catch {
      setErrorSnackbar(true);
    }
  };

  return (
    <>
      <Snackbar
        open={errorSnackbar}
        autoHideDuration={5000}
        onClose={() => setErrorSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="error" onClose={() => setErrorSnackbar(false)}>
          Erreur lors de la connexion
        </Alert>
      </Snackbar>
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
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
          {...register("email")}
        />

        <TextField
          variant="outlined"
          color="primary"
          label="Mot de passe"
          type="password"
          {...register("password")}
        />

        <Button variant="contained" color="primary" type="submit">
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
          <i>"Roule aussi vite que t'es con"</i> - Wout Van Aert
        </Typography>
      </Box>
    </>
  );
};
