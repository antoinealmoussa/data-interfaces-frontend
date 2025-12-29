import { TextField, Button, Box, Typography } from "@mui/material"
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { type SignInFormProps } from "../../types/authTypes";
import axios from "axios";
import API_URLS from "../../api/config";


export const SignInForm: React.FC = ({

}) => {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting }
    } = useForm<SignInFormProps>();

    const navigate = useNavigate();

    const onSubmit = async (data: SignInFormProps) => {
        try {
            const response = await axios.post(
                `${API_URLS.authentication}/sign-in`,
                JSON.stringify(data)
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
                {...register("firstName")}
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
