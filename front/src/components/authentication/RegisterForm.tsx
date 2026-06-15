import { TextField, Button, Box, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { type RegisterFormProps } from "../../types/authTypes";
import apiClient from "../../api/client";
import { WVA_QUOTE_TEXT } from "../../utils/constants";

export const RegisterForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormProps>();

  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormProps) => {
    await apiClient.post("/users/register", data);

    navigate("/login");
  };

  return (
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
        label="Prénom"
        {...register("first_name")}
      />

      <TextField
        variant="outlined"
        color="primary"
        label="Nom de famille"
        {...register("surname")}
      />

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
        {isSubmitting ? "Inscription..." : "S'inscrire"}
      </Button>

      <Typography key="caption" variant="subtitle2" color="primary">
        {WVA_QUOTE_TEXT}
      </Typography>
    </Box>
  );
};
