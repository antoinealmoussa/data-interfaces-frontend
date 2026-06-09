import { Box, Button } from "@mui/material";

interface FormActionsProps {
  onCancel?: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
}

export const FormActions = ({
  onCancel,
  isSubmitting,
  submitLabel = "Enregistrer",
}: FormActionsProps) => (
  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
    {onCancel && (
      <Button onClick={onCancel} disabled={isSubmitting}>
        Annuler
      </Button>
    )}
    <Button type="submit" variant="contained" disabled={isSubmitting}>
      {isSubmitting ? "Enregistrement..." : submitLabel}
    </Button>
  </Box>
);
