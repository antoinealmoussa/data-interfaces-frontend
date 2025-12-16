import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, TextField } from "@mui/material";
import Bar from './plots/Bar'
import axios, { AxiosError } from "axios";
import { Data } from "plotly.js";

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
    const [name, setName] = useState<string | null>(null);
    const [nameData, setNameData] = useState<ApiData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (name: string | null) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<ApiData>(
                `https://api.nationalize.io?name=${name}`
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

    const dataDashboard: Data[] = [
        {
            type: "bar",
            x: nameData?.country.map((c) => c.country_id),
            y: nameData?.country.map((c) => c.probability)
        },
    ]

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
                    <Bar data={dataDashboard} />
                </Paper>
            )
            }
        </Box >
    );
};

export default Dashboard;
