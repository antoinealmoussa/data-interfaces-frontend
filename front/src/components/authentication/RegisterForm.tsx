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
        await axios.post(
            `${API_URLS.backend}/users/register`,
            data
        );

        navigate("/login")

    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt: 2
            }}>

            <TextField
                key="firstName"
                variant="outlined"
                color="primary"
                label="Prénom"
                {...register("first_name")}
            />

            <TextField
                key="surname"
                variant="outlined"
                color="primary"
                label="Nom de famille"
                {...register("surname")}
            />

            <TextField
                key="email"
                variant="outlined"
                color="primary"
                label="Email"
                {...register("email")}
            />

            <TextField
                key="password"
                variant="outlined"
                color="primary"
                label="Mot de passe"
                type="password"
                {...register("password")}
            />

            <Button
                key="submitButton"
                variant="contained"
                color="primary"
                type="submit"
            >
                {isSubmitting ? "Inscription..." : "S'inscrire"}
            </Button>

            <Typography 
                key="caption"
                variant="subtitle2" 
                color="primary"
            >
                <i>"Roule aussi vite que t'es con"</i>   -   Wout Van Aert
            </Typography>
        </Box>
    )
}
