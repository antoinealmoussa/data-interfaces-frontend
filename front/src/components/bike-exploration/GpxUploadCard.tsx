import { useCallback, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { FileDropzone } from "../common/FileDropzone";
import type {
  UploadPhase,
  UploadProgress,
} from "../../hooks/bike-exploration/useBikeExploration";

interface Props {
  onUpload: (file: File) => void;
  onCancel: () => void;
  isUploading: boolean;
  phase: UploadPhase;
  result: { created: number; skipped: number } | null;
  progress: UploadProgress | null;
  error: string | null;
}

export const GpxUploadCard = ({
  onUpload,
  onCancel,
  isUploading,
  phase,
  result,
  progress,
  error,
}: Props) => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleUpload = useCallback(() => {
    if (files.length === 0) return;
    for (const file of files) {
      onUpload(file);
    }
    setFiles([]);
  }, [files, onUpload]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Importer des activités :
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          - Va sur ton compte Strava web, puis dans les paramètres
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          - Descends en bas de la page et clique sur le bouton sous "Télécharger
          votre compte"
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          - Attends que Strava t'envoie un mail avec une archive contenant
          toutes tes données : ces crevards ont rendu payant l'accès automatique
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          - Télécharge puis dépose ici ton fichier ZIP (export Strava)
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Box sx={{ mb: 2 }}>
            <Chip
              label={`${result.created} importée(s), ${result.skipped} ignorée(s)`}
              color={result.created > 0 ? "success" : "default"}
              size="small"
            />
          </Box>
        )}

        <FileDropzone
          accept=".zip"
          multiple
          onFilesSelected={handleFilesSelected}
        />

        {files.length > 0 && !isUploading && (
          <List dense>
            {files.map((f, i) => (
              <ListItem key={i}>
                <ListItemIcon>
                  <InsertDriveFileIcon />
                </ListItemIcon>
                <ListItemText
                  primary={f.name}
                  secondary={`${(f.size / 1024).toFixed(1)} KB`}
                />
              </ListItem>
            ))}
          </List>
        )}

        {phase === "uploading" && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Envoi du fichier en cours...
            </Typography>
          </Box>
        )}

        {phase === "processing" && progress && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={(progress.current / progress.total) * 100}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {progress.name
                ? `${progress.name} (${progress.current}/${progress.total})`
                : `${progress.current}/${progress.total}`}
            </Typography>
          </Box>
        )}

        {phase === "cancelling" && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Annulation en cours...
            </Typography>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 1 }}>
          {phase === "processing" && (
            <Button
              variant="outlined"
              color="error"
              onClick={onCancel}
              fullWidth
            >
              Annuler
            </Button>
          )}
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={
              files.length === 0 || isUploading || phase === "cancelling"
            }
            fullWidth={phase !== "processing"}
          >
            {isUploading
              ? "Import en cours..."
              : `Importer ${files.length} fichier(s)`}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
