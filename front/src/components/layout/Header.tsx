import { Box, Button, Typography } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";

interface HeaderProps {
    height: number;
}

export const Header: React.FC<HeaderProps> = ({
    height
}) => {
    const { user, logout } = useAuth();
    return (
        <Box
            sx={{
                bgcolor: "white",
                p: 2,
                boxShadow: 1,
                height,
                zIndex: 10,
                position: "sticky"
            }}
        >
            <Typography variant="h6">{`Salut ${user?.first_name} ${user?.surname}`}</Typography>
            <Button
                variant="contained"
                color="secondary"
                onClick={() => logout()}
            >
                Se déconnecter
            </Button>
        </Box>
    );
};
