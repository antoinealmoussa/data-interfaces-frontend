import { Box } from "@mui/material";

export const UserProfile = () => {

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
            Mon profil
        </Box >
    );
};
