import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
// import Plot from 'plotly.js';
import axios, { AxiosError } from "axios";

interface CountryProbability {
    country_id: string;
    probability: number;
}

interface ApiData {
    count: number;
    name: string;
    country: CountryProbability[];
}

const Dashboard = () => {
    const [data, setData] = useState<ApiData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<ApiData>(
                "https://api.nationalize.io?name=nathaniel"
            );
            setData(response.data);
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

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Tableau de bord probabilités prénom
            </Typography>
            <Button variant="contained" onClick={fetchData} sx={{ mb: 2 }}>
                {loading ? "Chargement..." : "Rafraîchir les données"}
            </Button>
            {error && <p style={{ color: "red" }}>Erreur : {error}</p>}
            {data && (
                <Paper elevation={3} sx={{ p: 2 }}>
                    <h2>Données récupérées :</h2>
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                </Paper>
            )}
        </Box>
    );
};

export default Dashboard;
