import { TextField, Button, Box, Typography, Divider } from "@mui/material"
import { Link as BaseLink } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { type LoginFormProps } from "../../types/authTypes";
import axios from "axios";


export const LoginForm: React.FC = ({

}) => {
    const {
        register,
        handleSubmit,
        formState: { isSubmitting }
    } = useForm<LoginFormProps>();

    const navigate = useNavigate();

    const onSubmit = async (data: LoginFormProps) => {
        try {
            const response = await axios.post(
                `https://localhost:8002/login`,
                JSON.stringify(data)
            );

            if (!response) {
                throw new Error("Identifiants invalides")
            }
            navigate("/")

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
                {isSubmitting ? "Connexion..." : "Se connecter"}
            </Button>

            <Divider
                sx={{ my: 1 }}
            >
                OU
            </Divider>

            <Button
                variant="contained"
                color="secondary"
                component={BaseLink}
                to="/sign-in"
            >
                S'inscrire
            </Button>
            <Typography variant="subtitle2" color="primary">
                <i>"Roule aussi vite que t'es con"</i>   -   Wout Van Aert
            </Typography>
        </Box>
    )
}
