import { Box, Typography, Link } from "@mui/material";
import { Link as BaseLink } from 'react-router-dom';


interface SidebarProps {
    width: number;
    headerHeight: number;
}

const pages = [
    {
        label: "Accueil",
        path: "/",
    },
    {
        label: "Origine des prénoms",
        path: "/name-dashboard"
    }
];

export const Sidebar: React.FC<SidebarProps> = ({
    width,
    headerHeight
}) => {
    return (
        <Box sx={{
            width,
            bgcolor: "white",
            height: "100vh",
            display: 'flex',
            flexDirection: 'column',
            position: "fixed",
            overflow: "auto",
        }}>
            <Box sx={{
                height: headerHeight,
                overflow: "auto",
                display: "flex",
                flexDirection: "row"
            }}>
                <img
                    style={{ height: "100%" }}
                    src="AntoineGif2.gif"
                />
                <Typography
                    variant="h6"
                    sx={{ alignContent: "center", ml: 2 }}>
                    Coucou
                </Typography>
            </Box>
            <Box sx={{
                flexGrow: 1,
                overflow: 'auto',
                width: "100%"
            }}>
                {pages.map(({ label, path }) => (
                    <Box sx={{
                        flexGrow: 1,
                        overflow: 'auto',
                        width: "100%",
                        p: 3
                    }}>
                        <Link
                            key={path}
                            component={BaseLink}
                            to={path}
                            color="primary"
                            underline="hover"
                            sx={{ color: "black" }}
                        >
                            {label}
                        </Link>
                    </Box>
                ))}

            </Box>
        </Box>
    );
};
