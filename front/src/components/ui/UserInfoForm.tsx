import { useEffect } from "react";
import { TextField, Button, Box } from "@mui/material";
import { useForm } from "react-hook-form";
import type { User } from "../../types/authTypes";

export interface UserInfoFormProps {
  initialData: User;
  onSubmit: (data: UserUpdateData) => Promise<void>;
  isSubmitting?: boolean;
}

export type UserUpdateData = Pick<User, "first_name" | "surname" | "email">;

export const UserInfoForm: React.FC<UserInfoFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserUpdateData>({
    defaultValues: {
      first_name: initialData.first_name,
      surname: initialData.surname,
      email: initialData.email,
    },
  });

  useEffect(() => {
    reset({
      first_name: initialData.first_name,
      surname: initialData.surname,
      email: initialData.email,
    });
  }, [initialData, reset]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        maxWidth: 400,
      }}
    >
      <TextField
        label="Prénom"
        {...register("first_name", {
          required: "Le prénom est requis",
        })}
        error={!!errors.first_name}
        helperText={errors.first_name?.message}
      />

      <TextField
        label="Nom de famille"
        {...register("surname", {
          required: "Le nom de famille est requis",
        })}
        error={!!errors.surname}
        helperText={errors.surname?.message}
      />

      <TextField
        label="Email"
        type="email"
        {...register("email", {
          required: "L'email est requis",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Adresse email invalide",
          },
        })}
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <Button
        variant="contained"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </Box>
  );
};