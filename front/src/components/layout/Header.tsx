import { Box, Typography } from "@mui/material";

interface HeaderProps {
    height: number;
}

export const Header: React.FC<HeaderProps> = ({
    height
}) => {
    return (
        <Box sx={{ bgcolor: "white", p: 2, boxShadow: 1, height, zIndex: 10, position: "sticky" }}>
            <Typography variant="h6">Header vide pour le moment</Typography>
        </Box>
    );
};
