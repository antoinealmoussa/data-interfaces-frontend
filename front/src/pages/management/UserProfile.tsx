import { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api/client";
import type { User } from "../../types/authTypes";
import {
  UserInfoForm,
  type UserUpdateData,
} from "../../components/ui/UserInfoForm";
import { NotificationSnackbar } from "../../components/common/NotificationSnackbar";
import { PageGuard } from "../../components/common/PageGuard";
import { RoleGuard } from "../../components/common/RoleGuard";
import { AccessRequestsManager } from "../../components/ui/AccessRequestsManager";
import { useSnackbar } from "../../hooks/useSnackbar";

const UserProfile = () => {
  const queryClient = useQueryClient();
  const { snackbar, showSnackbar, handleCloseSnackbar } = useSnackbar();

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const response = await apiClient.get<{ user: User }>("/users/me");
      return response.data.user;
    },
  });

  useEffect(() => {
    if (isError) {
      showSnackbar("error", "Erreur lors du chargement du profil");
    }
  }, [isError, showSnackbar]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<UserUpdateData>) =>
      apiClient.put<User>("/users/me", data),
    onSuccess: (response) => {
      queryClient.setQueryData<User>(["me"], response.data);
      showSnackbar("success", "Profil mis à jour avec succès");
    },
    onError: () => {
      showSnackbar("error", "Erreur lors de la mise à jour du profil");
    },
  });

  const handleSubmit = async (data: UserUpdateData) => {
    if (!user) return;

    const modifiedData: Partial<UserUpdateData> = {};
    if (data.first_name !== user.first_name)
      modifiedData.first_name = data.first_name;
    if (data.surname !== user.surname) modifiedData.surname = data.surname;
    if (data.email !== user.email) modifiedData.email = data.email;

    if (Object.keys(modifiedData).length === 0) {
      showSnackbar("success", "Aucune modification détectée");
      return;
    }

    updateMutation.mutate(modifiedData);
  };

  return (
    <PageGuard loading={isLoading} error={null}>
      <Box
        sx={{
          p: 3,
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          height: "100%",
          width: "100%",
        }}
      >
        <Typography variant="h5" component="h1">
          Mon profil
        </Typography>

        {user && (
          <UserInfoForm
            key={user.id}
            initialData={user}
            onSubmit={handleSubmit}
            isSubmitting={updateMutation.isPending}
          />
        )}

        <RoleGuard roles={["admin"]}>
          <AccessRequestsManager />
        </RoleGuard>

        <NotificationSnackbar
          open={snackbar.open}
          severity={snackbar.severity}
          message={snackbar.message}
          onClose={handleCloseSnackbar}
        />
      </Box>
    </PageGuard>
  );
};

export default UserProfile;
