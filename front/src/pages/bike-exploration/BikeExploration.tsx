import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Grid, Typography } from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

import { GpxUploadCard } from "../../components/bike-exploration/GpxUploadCard";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { GenericDataTable } from "../../components/common/GenericDataTable";
import { InteractiveMap } from "../../components/ui/InteractiveMap";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { bikeApi } from "../../api/bike-exploration/bikeApi";

import {
  useConqueredCols,
  useUploadActivities,
} from "../../hooks/bike-exploration/useBikeExploration";

const BikeExploration = () => {
  const queryClient = useQueryClient();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedColId, setSelectedColId] = useState<number | null>(null);

  const { data: conqueredCols = [], isLoading: colsLoading } =
    useConqueredCols();
  const { mutate, cancel, phase, progress, result, error, isPending } =
    useUploadActivities();

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

  if (colsLoading && !hasData) {
    return (
      <Box
        sx={{ p: 3, flex: 1, overflow: "auto", height: "100%", width: "100%" }}
      >
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <Box
      sx={{ p: 3, flex: 1, overflow: "auto", height: "100%", width: "100%" }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4">Exploration vélo</Typography>
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
        <Grid container spacing={3} alignItems="stretch">
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                Cols gravis ({conqueredCols.length})
              </Typography>
              <GenericDataTable
                columns={[
                  { key: "name", label: "Col" },
                  {
                    key: "activity_count",
                    label: "Activités",
                    render: (v) => String(v ?? 0),
                    defaultOrder: "desc",
                  },
                  {
                    key: "total_crossings",
                    label: "Ascensions",
                    render: (v) => String(v ?? 0),
                    defaultOrder: "desc",
                  },
                  {
                    key: "elevation",
                    label: "Altitude",
                    render: (v) => (v ? `${String(v)} m` : "—"),
                  },
                  {
                    key: "country",
                    label: "Pays",
                    render: (v) => (v != null ? String(v) : "—"),
                  },
                ]}
                rows={conqueredCols}
                getRowId={(c) => c.id}
                emptyMessage="Aucun col gravi"
                onRowClick={(row) => setSelectedColId(row.id)}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{ display: "flex", flexDirection: "column", height: "100%" }}
            >
              <InteractiveMap
                height="100%"
                selectedMarkerId={selectedColId}
                markers={conqueredCols.map((c) => ({
                  id: c.id,
                  latitude: c.latitude,
                  longitude: c.longitude,
                  popup: (
                    <>
                      <strong>{c.name}</strong>
                      <br />{c.activity_count} activité{c.activity_count > 1 ? "s" : ""}
                      <br />{c.total_crossings} ascension{c.total_crossings > 1 ? "s" : ""}
                      {c.elevation ? <><br />{c.elevation} m</> : null}
                      {c.country ? <><br />{c.country}</> : null}
                    </>
                  ),
                }))}
              />
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default BikeExploration;
