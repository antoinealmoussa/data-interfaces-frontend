import { useState } from "react";
import { Box, Button, TextField } from "@mui/material";
import axios, { AxiosError } from "axios";
import StandardBarChart from "../components/plots/StandardBarChart";
import { type StandardBarChartPoint } from "../types/plotTypes"


interface CountryProbability {
    x: string;
    y: number;
}

interface ApiData {
    probabilities: CountryProbability[] | undefined;
}

export const NameDashboard = () => {
    const [name, setName] = useState<string>("");
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
                name === "" ? "Veuillez saisir un prénom" :
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
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            p: 3
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                mb: 2
            }}>
                <TextField
                    variant="outlined"
                    value={name}
                    onChange={n => setName(n.target.value)}
                    color="primary"
                    label="Prénom"
                />
                <Button
                    variant="contained"
                    onClick={() => fetchData(name)}
                    sx={{ ml: 2 }}
                    color="primary"
                >
                    {loading ? "Chargement..." : "D'où vient ce prénom ?"}
                </Button>
            </Box>

            {error && <p style={{ color: "red" }}>Erreur : {error}</p>}
            {nameData && (

                <Box sx={{
                    flex: 1,
                    minHeight: 0,
                    bgcolor: '#fff'
                }}><StandardBarChart
                        dataSet={dataDashboard}
                        xAxisLabel="Pays d'origine"
                        yAxisLabel="Probabilité"
                    /></Box>
            )
            }

        </Box >
    );
};
