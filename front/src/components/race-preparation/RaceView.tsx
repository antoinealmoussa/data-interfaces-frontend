import { Box, Button, CircularProgress, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import SectionSplitter from "./SectionSplitter";
import {
  useRace,
  useTrackPoints,
  useDeleteRace,
} from "../../hooks/race-preparation/useRacePreparation";

interface RaceViewProps {
  raceId: number;
  onBack: () => void;
  onDeleted: () => void;
}

export default function RaceView({ raceId, onBack, onDeleted }: RaceViewProps) {
  const { data: race, isLoading: raceLoading } = useRace(raceId);
  const { data: trackPointsData, isLoading: tpLoading } =
    useTrackPoints(raceId);
  const deleteRace = useDeleteRace();

  const trackPoints = trackPointsData?.track_points ?? [];

  const handleDelete = () => {
    if (!confirm("Supprimer cette course et toutes ses données ?")) return;
    deleteRace.mutate(raceId, { onSuccess: onDeleted });
  };

  if (raceLoading || tpLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!race) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Course introuvable.</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Button startIcon={<ArrowBackIcon />} onClick={onBack}>
          Retour
        </Button>
        <Typography variant="h5">
          {race.name} ({(race.total_distance / 1000).toFixed(1)} km · D+{" "}
          {race.total_elevation_gain.toFixed(0)} m · D-{" "}
          {race.total_elevation_loss.toFixed(0)} m)
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
          disabled={deleteRace.isPending}
        >
          Supprimer
        </Button>
      </Box>

      {trackPoints.length > 0 && (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <SectionSplitter
            key={raceId}
            raceId={raceId}
            trackPoints={trackPoints}
            sections={race.sections}
          />
        </Box>
      )}
    </Box>
  );
}
