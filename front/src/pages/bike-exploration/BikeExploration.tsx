import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Grid, Typography } from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

import { GpxUploadCard } from "../../components/bike-exploration/GpxUploadCard";
import { ColTable } from "../../components/bike-exploration/ColTable";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { bikeApi } from "../../api/bike-exploration/bikeApi";

import {
  useConqueredCols,
  useUploadActivities,
} from "../../hooks/bike-exploration/useBikeExploration";

const BikeExploration = () => {
  const queryClient = useQueryClient();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const { data: conqueredCols = [] } = useConqueredCols();
  const { mutate, cancel, phase, progress, result, error, isPending } = useUploadActivities();

  const resetMutation = useMutation({
    mutationFn: bikeApi.resetActivities,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["be", "cols", "conquered"] });
    },
    onSettled: () => setResetDialogOpen(false),
  });

  const hasData = conqueredCols.length > 0;

  const handleUpload = (file: File) => {
    mutate(file);
  };

  return (
    <Box sx={{ p: 3, flex: 1, overflow: "auto", height: "100%", width: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4">
          Exploration vélo
        </Typography>
        {hasData && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={() => setResetDialogOpen(true)}
            disabled={resetMutation.isPending}
          >
            Réinitialiser
          </Button>
        )}
      </Box>

      <ConfirmDialog
        open={resetDialogOpen}
        title="Réinitialiser les données"
        message="Cette action supprime toutes vos activités importées et les cols qui y sont associés. Les cols de référence ne sont pas affectés. Cette action est irréversible."
        confirmLabel="Réinitialiser"
        confirmColor="error"
        loading={resetMutation.isPending}
        onConfirm={() => resetMutation.mutate()}
        onCancel={() => setResetDialogOpen(false)}
      />

      {!hasData ? (
          <GpxUploadCard
          onUpload={handleUpload}
          onCancel={cancel}
          isUploading={isPending}
          phase={phase}
          result={result}
          progress={progress}
          error={error}
        />
      ) : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ColTable cols={conqueredCols} />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default BikeExploration;
