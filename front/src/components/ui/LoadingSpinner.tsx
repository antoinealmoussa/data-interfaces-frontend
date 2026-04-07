import { Box, CircularProgress } from "@mui/material";
import type { LoadingSpinnerProps } from "../../types/uiTypes";

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 40 }) => {
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                py: 4,
            }}
        >
            <CircularProgress size={size} />
        </Box>
    );
};
