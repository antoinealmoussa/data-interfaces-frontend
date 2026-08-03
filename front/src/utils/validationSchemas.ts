import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().min(1, "L'email est requis").email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
  first_name: z.string().min(1, "Le prénom est requis"),
  surname: z.string().min(1, "Le nom de famille est requis"),
});

export const userInfoSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis"),
  surname: z.string().min(1, "Le nom de famille est requis"),
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Adresse email invalide"),
});
