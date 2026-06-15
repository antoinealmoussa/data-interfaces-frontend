import { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import apiClient from "../../api/client";
import type { User } from "../../types/authTypes";
import {
  UserInfoForm,
  type UserUpdateData,
} from "../../components/ui/UserInfoForm";
import { NotificationSnackbar } from "../../components/common/NotificationSnackbar";
import { PageGuard } from "../../components/common/PageGuard";

const UserProfile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    severity: "success" | "error";
    message: string;
  }>({
    open: false,
    severity: "success",
    message: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await apiClient.get<{ user: User }>("/users/me");
        setUser(response.data.user);
      } catch {
        setSnackbar({
          open: true,
          severity: "error",
          message: "Erreur lors du chargement du profil",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSubmit = async (data: UserUpdateData) => {
    if (!user) return;

    const modifiedData: Partial<UserUpdateData> = {};
    if (data.first_name !== user.first_name)
      modifiedData.first_name = data.first_name;
    if (data.surname !== user.surname) modifiedData.surname = data.surname;
    if (data.email !== user.email) modifiedData.email = data.email;

    if (Object.keys(modifiedData).length === 0) {
      setSnackbar({
        open: true,
        severity: "success",
        message: "Aucune modification détectée",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.put<User>("/users/me", modifiedData);
      setUser(response.data);
      setSnackbar({
        open: true,
        severity: "success",
        message: "Profil mis à jour avec succès",
      });
    } catch {
      setSnackbar({
        open: true,
        severity: "error",
        message: "Erreur lors de la mise à jour du profil",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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
            isSubmitting={isSubmitting}
          />
        )}

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
