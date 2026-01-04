import { TextField, Button, Box, Typography } from "@mui/material"
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { type RegisterFormProps } from "../../types/authTypes";
import axios from "axios";
import API_URLS from "../../api/config";


export const RegisterForm: React.FC = ({

}) => {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting }
    } = useForm<RegisterFormProps>();

    const navigate = useNavigate();

    const onSubmit = async (data: RegisterFormProps) => {
        try {
            const response = await axios.post(
                `${API_URLS.backend}/users/register`,
                data
            );

            if (!response) {
                throw new Error("Identifiants invalides")
            }
            navigate("/login")

        } catch (error) {
            alert("Erreur lors de la connexion");
        }
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: 2,
                p: 3
            }}>

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

            <Button
                variant="contained"
                color="primary"
                type="submit"
            >
                {isSubmitting ? "Inscription..." : "S'inscrire"}
            </Button>

            <Typography variant="subtitle2" color="primary">
                <i>"Roule aussi vite que t'es con"</i>   -   Wout Van Aert
            </Typography>
        </Box>
    )
}
