import { Box, Alert } from "@mui/material";
import { TeamCreationForm } from "../../components/rugby-teams/TeamCreationForm";
import { useAuth } from "../../hooks/useAuth";
import { useLocation } from "react-router-dom";

export const TeamCreation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const successMessage = location.state?.message;

  return (
    <Box sx={{ p: 3 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      {user && (
        <TeamCreationForm
          userId={user.id}
        />
      )}
    </Box>
  );
};
