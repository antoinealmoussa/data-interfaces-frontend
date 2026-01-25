import { Box } from "@mui/material";

export const RugbyTeams = () => {

    return (
        <Box
            sx={{
                p: 3,
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                flexWrap: 'wrap',
                height: "100%",
                width: '100%'
            }}
        >
            Rugby teams
        </Box >
    );
};
