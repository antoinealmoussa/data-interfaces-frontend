import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { RaceUpload } from "../../components/race-preparation/RaceUpload";
import {
  useRaces,
  useUploadGpx,
} from "../../hooks/race-preparation/useRacePreparation";

const RacePreparation = () => {
  const { raceId } = useParams<{ raceId: string }>();
  const navigate = useNavigate();
  const { data: races, isLoading } = useRaces();
  const uploadGpx = useUploadGpx();
  const [showUpload, setShowUpload] = useState(false);

  if (raceId) {
    return <Outlet />;
  }

  return (
    <Box
      sx={{
        p: 3,
        flex: 1,
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography variant="h4">Préparation de course</Typography>
        <Box sx={{ flex: 1 }} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowUpload(!showUpload)}
        >
          Nouvelle course
        </Button>
      </Box>

      {showUpload && (
        <Box sx={{ mb: 3 }}>
          <RaceUpload
            onUpload={(file) =>
              uploadGpx.mutate(file, { onSuccess: () => setShowUpload(false) })
            }
            isUploading={uploadGpx.isPending}
            error={uploadGpx.isError ? "Erreur lors de l'import" : null}
          />
        </Box>
      )}

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : !races || races.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            p: 6,
            border: "1px dashed",
            borderColor: "grey.400",
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Aucune course
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Importez un fichier GPX pour commencer.
          </Typography>
        </Box>
      ) : (
        <List>
          {races.map((race) => (
            <ListItemButton
              key={race.id}
              onClick={() => navigate(`/race-preparation/${race.id}`)}
              sx={{
                border: "1px solid",
                borderColor: "grey.300",
                borderRadius: 1,
                mb: 1,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <ListItemText
                primary={race.name}
                secondary={`${(race.total_distance / 1000).toFixed(1)} km — D+ ${race.total_elevation_gain.toFixed(0)} m — ${race.sections.length} sections`}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
};

export default RacePreparation;
