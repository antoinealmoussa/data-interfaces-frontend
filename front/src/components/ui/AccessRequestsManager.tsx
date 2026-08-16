import { useState } from "react";
import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api/client";
import type {
  Application,
  ApplicationAccessRequest,
} from "../../types/authTypes";
import { API_PATHS } from "../../api/endpoints";
import { ApplicationSelection } from "./ApplicationSelection";
import { LoadingSpinner } from "./LoadingSpinner";
import { NotificationSnackbar } from "../common/NotificationSnackbar";
import { useSnackbar } from "../../hooks/useSnackbar";

interface RequestCardProps {
  request: ApplicationAccessRequest;
  allApplications: Application[];
  isSubmitting: boolean;
  onApprove: (applications: string[]) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({
  request,
  allApplications,
  isSubmitting,
  onApprove,
}) => {
  const [selected, setSelected] = useState<string[]>(
    request.applications.map((app) => app.name),
  );

  return (
    <Card variant="outlined">
      <CardContent
        sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
      >
        <Typography variant="subtitle1">
          {request.user.first_name} {request.user.surname} —{" "}
          {request.user.email}
        </Typography>
        <ApplicationSelection
          applications={allApplications}
          value={selected}
          onChange={setSelected}
          label="Sélection (modifiable)"
        />
        <Box>
          <Button
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            onClick={() => onApprove(selected)}
          >
            {isSubmitting ? "Approbation..." : "Approuver"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export const AccessRequestsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { snackbar, showSnackbar, handleCloseSnackbar } = useSnackbar();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["accessRequests"],
    queryFn: async () => {
      const response = await apiClient.get<ApplicationAccessRequest[]>(
        API_PATHS.applicationAccessRequests.base,
      );
      return response.data;
    },
  });

  const { data: allApplications = [] } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const response = await apiClient.get<Application[]>(
        API_PATHS.applications.base,
      );
      return response.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({
      id,
      applications,
    }: {
      id: number;
      applications: string[];
    }) =>
      apiClient.put(`/application-access-requests/${id}`, { applications }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessRequests"] });
      showSnackbar("success", "Demande approuvée");
    },
    onError: () => {
      showSnackbar("error", "Erreur lors de l'approbation");
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6">Demandes d'accès</Typography>
      {requests.length === 0 ? (
        <Typography variant="body2">Aucune demande en attente</Typography>
      ) : (
        requests.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            allApplications={allApplications}
            isSubmitting={approveMutation.isPending}
            onApprove={(applications) =>
              approveMutation.mutate({ id: request.id, applications })
            }
          />
        ))
      )}
      <NotificationSnackbar
        open={snackbar.open}
        severity={snackbar.severity}
        message={snackbar.message}
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};
