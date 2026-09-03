import { useCallback, useRef, useState } from "react";
import { Alert, Box, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface FileDropzoneProps {
  accept: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  isPending?: boolean;
  error?: string | null;
  title?: string;
  subtitle?: string;
}

const matchesAccept = (file: File, accept: string) =>
  file.name.toLowerCase().endsWith(accept.toLowerCase());

export const FileDropzone = ({
  accept,
  multiple = false,
  onFilesSelected,
  isPending = false,
  error = null,
  title = "Déposez vos fichiers ici",
  subtitle = "ou cliquez pour sélectionner",
}: FileDropzoneProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [rejectedNames, setRejectedNames] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFiles = useCallback(
    (files: File[]) => {
      const accepted = files.filter((f) => matchesAccept(f, accept));
      const rejected = files.filter((f) => !matchesAccept(f, accept));
      setRejectedNames(rejected.map((f) => f.name));
      if (accepted.length > 0) {
        onFilesSelected(multiple ? accepted : accepted.slice(0, 1));
      }
    },
    [accept, multiple, onFilesSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(Array.from(e.dataTransfer.files));
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragOver(false), []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(Array.from(e.target.files ?? []));
      e.target.value = "";
    },
    [handleFiles],
  );

  return (
    <Box
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      sx={{
        border: "2px dashed",
        borderColor: dragOver ? "primary.main" : "grey.400",
        borderRadius: 2,
        p: 4,
        textAlign: "center",
        cursor: "pointer",
        bgcolor: dragOver ? "action.hover" : "background.paper",
        transition: "all 0.2s",
        "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={handleChange}
      />
      <CloudUploadIcon
        sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
      />
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
      {isPending && (
        <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
          Import en cours...
        </Typography>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2, textAlign: "left" }}>
          {error}
        </Alert>
      )}
      {rejectedNames.length > 0 && (
        <Alert severity="warning" sx={{ mt: 2, textAlign: "left" }}>
          {`Format non supporté (attendu : ${accept}) : ${rejectedNames.join(", ")}`}
        </Alert>
      )}
    </Box>
  );
};
