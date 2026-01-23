import { Box } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { mapUserApplicationToMenuItem } from "../../types/uiTypes";
import { MultiTypeMenuItem } from "./MultiTypeMenuItem";
import API_URLS from "../../api/config";
import axios from "axios";
import { useQuery } from "@tanstack/react-query"
import type { ApiUserApplication } from "../../types/uiTypes";

const fetchUserApplications = async (userId: number) => {
    const { data } = await axios.get<ApiUserApplication[]>(
        `${API_URLS.backend}/user-applications/${userId}`
    )
    return data.map(item => mapUserApplicationToMenuItem(item));
};

export const HorizontalUserAppMenu = () => {

    const { user } = useAuth();

    const { data, isLoading, isError } = useQuery({
        queryKey: ['userApplication', user?.id],
        queryFn: () => fetchUserApplications(user!.id),
        enabled: !!user
    });

    if (isLoading) return <Box>Chargement...</Box>;
    if (isError) return <Box>Erreur lors de la récupération des données</Box>;
    if (!data) return null;

    return (
        data.map(applicationMenuItem => (
            <MultiTypeMenuItem
                item={applicationMenuItem}
            />
        ))
    );
};
