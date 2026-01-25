import { useQuery } from "@tanstack/react-query";
import type { ApiUserApplication } from "../types/uiTypes";
import axios from "axios";
import API_URLS from "../api/config";
import type { User } from "../types/authTypes";

const fetchUserApplications = async (userId: number) => {
    const { data } = await axios.get<ApiUserApplication[]>(
        `${API_URLS.backend}/user-applications/${userId}`
    )
    return data;
};

export const useUserApplications = (user: User | null) => {
  return useQuery({
    queryKey: ['user-applications'],
    queryFn: () => fetchUserApplications(user!.id), 
    staleTime: 1000 * 60 * 5,
    enabled: !!user && !!user.id
  });
};