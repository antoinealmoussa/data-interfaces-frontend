import { Box } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { mapUserApplicationToMenuItem } from "../../types/uiTypes";
import { MultiTypeMenuItem } from "./MultiTypeMenuItem";
import { DYNAMIC_APP_ROUTES } from "../../routes";
import type { AppName } from "../../types/routesTypes";
import { useUserApplications } from "../../hooks/useUserApplications";


export const HorizontalUserAppMenu = () => {

    const { user } = useAuth();
    const { data: userApps, isLoading, isError } = useUserApplications(user)


    if (isLoading) return <Box>Chargement...</Box>;
    if (isError) return <Box>Erreur lors de la récupération des données</Box>;
    if (!userApps) return null;

    return (
        userApps?.map((app) => {
            const config = DYNAMIC_APP_ROUTES[app.name as AppName];
            if (!config) {
                return null;
            };
            return (
                <MultiTypeMenuItem
                    key={config.path}
                    item={mapUserApplicationToMenuItem(app, config)}
                />
            )
        })
    )
};
