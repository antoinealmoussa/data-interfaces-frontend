import { useState } from "react";
import { Box, Typography, Button, Paper, TextField } from "@mui/material";
import axios, { AxiosError } from "axios";
import StandardBarChart from "../plots/Bar";
import { type StandardBarChartPoint } from "../../types/plotTypes"


interface CountryProbability {
    x: string;
    y: number;
}

interface ApiData {
    probabilities: CountryProbability[] | undefined;
}

const Dashboard = () => {
    const [name, setName] = useState<string | null>(null);
    const [nameData, setNameData] = useState<ApiData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (name: string | null) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<ApiData>(
                `http://localhost:8000/name_probabilites/${name}`
            );
            setNameData(response.data);
        } catch (error) {
            const errorMessage =
                error instanceof AxiosError
                    ? error.response?.data?.message || error.message
                    : "Une erreur inconnue est survenue";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const dataDashboard: StandardBarChartPoint[] | undefined = nameData?.probabilities;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Tableau de bord probabilités prénom
            </Typography>
            <TextField
                variant="outlined"
                value={name}
                onChange={n => setName(n.target.value)}
                color="primary"
            />
            <Button
                variant="contained"
                onClick={() => fetchData(name)}
                sx={{ mb: 2 }}
                color="primary"
            >
                {loading ? "Chargement..." : "Rafraîchir les données"}
            </Button>
            {error && <p style={{ color: "red" }}>Erreur : {error}</p>}
            {nameData && (
                <Paper elevation={3} sx={{ p: 2 }}>
                    <StandardBarChart dataSet={dataDashboard} />
                </Paper>
            )
            }
        </Box >
    );
};

export default Dashboard;
