import { Box, CircularProgress, Typography } from "@mui/material";
import type { LoadingSpinnerProps } from "../../types/uiTypes";

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 40, text = "Chargement..." }) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
                gap: 2,
            }}
        >
            <CircularProgress size={size} />
            {text && <Typography>{text}</Typography>}
        </Box>
    );
};
