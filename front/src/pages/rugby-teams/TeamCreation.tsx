import { Box, Alert } from "@mui/material";
import { TeamCreationForm } from "../../components/rugby-teams/TeamCreationForm";
import { useLocation } from "react-router-dom";

const TeamCreation = () => {
  const location = useLocation();
  const successMessage = location.state?.message;

  return (
    <Box sx={{ p: 3 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      <TeamCreationForm />
    </Box>
  );
};

export default TeamCreation;
