import { Box } from "@mui/material";
import { Header } from "./layout/Header";
import { Outlet } from "react-router-dom";

interface AppContainerProps {
    headerHeight: number;
}

export const AppContainer: React.FC<AppContainerProps> = ({
    headerHeight,
}) => {
    return (
        <Box sx={{
            display: "flex",
            width: "100vw",
            height: "100vh",
            overflow: "hidden"
        }}>
            <Box sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                height: "100%"
            }}>
                <Header height={headerHeight} />
                <Outlet />
            </Box>
        </Box>
    );
};
