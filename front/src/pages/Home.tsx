import { Box, Paper, TextField, Button } from "@mui/material";
import { useState } from "react";

export const Home = () => {
    const [name, setName] = useState<string | null>(null);
    return (
        <Box
            sx={{
                p: 3,
                flex: 1,
                overflow: 'auto',
            }}
        >
            <Box sx={{ flex: 1, display: "flex", flexDirection: "row", p: 1, }}>
                <TextField
                    variant="outlined"
                    value={name}
                    onChange={n => setName(n.target.value)}
                    color="primary"
                    label="Prénom"
                    sx={{ mb: 2 }}
                />
                <Button
                    variant="contained"
                    sx={{ ml: 2, mb: 2 }}
                    color="primary"
                >
                    {"D'où vient ce prénom ?"}
                </Button>
            </Box>
            <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
                <Paper
                    sx={{
                        height: "100%",
                        width: "100%",
                        p: 2,
                        overflow: "auto",
                    }}
                >
                    {name && (
                        <div>
                            <p>Contenu principal qui s'adapte à la taille de la fenêtre.</p>
                            <img src="src/assets/react.svg" height="800px" />
                        </div>
                    )
                    }

                </Paper>
            </Box>
        </Box >
    );
};
