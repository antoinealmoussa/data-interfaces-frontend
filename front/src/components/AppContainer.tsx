import { Box } from "@mui/material";
import { Header } from "./layout/Header";
import { Sidebar } from "./layout/Sidebar";
import { Outlet } from "react-router-dom";

interface AppContainerProps {
    sidebarWidth: number;
    headerHeight: number;
}

export const AppContainer: React.FC<AppContainerProps> = ({
    sidebarWidth,
    headerHeight,
}) => {
    return (
        <Box sx={{
            display: "flex",
            width: "100vw",
            height: "100vh",
            overflow: "hidden"
        }}>
            <Sidebar width={sidebarWidth} headerHeight={headerHeight} />
            <Box sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                ml: `${sidebarWidth}px`,
                overflow: "hidden",
                height: "100%"
            }}>
                <Header height={headerHeight} />
                <Outlet />
            </Box>
        </Box>
    );
};
