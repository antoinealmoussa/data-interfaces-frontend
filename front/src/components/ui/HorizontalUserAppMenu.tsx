import { useAuth } from "../../hooks/useAuth";
import { mapUserApplicationToMenuItem } from "../../types/uiTypes";
import { MultiTypeMenuItem } from "./MultiTypeMenuItem";
import { DYNAMIC_APP_ROUTES } from "../../routes";
import type { AppName } from "../../types/routesTypes";


export const HorizontalUserAppMenu = () => {

    const { applications } = useAuth();

    if (!applications) return null;

    return (
        applications.map((app) => {
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
