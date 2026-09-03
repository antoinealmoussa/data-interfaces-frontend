import { FileDropzone } from "../common/FileDropzone";

interface RaceUploadProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
  error: string | null;
}

export const RaceUpload = ({ onUpload, isUploading, error }: RaceUploadProps) => (
  <FileDropzone
    accept=".gpx"
    title="Déposez un fichier GPX ici"
    subtitle="ou cliquez pour sélectionner un fichier"
    onFilesSelected={(files) => {
      const file = files[0];
      if (file) onUpload(file);
    }}
    isPending={isUploading}
    error={error}
  />
);
