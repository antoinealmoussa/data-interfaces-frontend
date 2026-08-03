import { Box, Checkbox, FormControlLabel, FormGroup, Typography } from "@mui/material";
import type { Application } from "../../types/authTypes";
import { toggleArrayItem } from "../../utils/array";

interface ApplicationSelectionProps {
  applications: Application[];
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
}

export const ApplicationSelection: React.FC<ApplicationSelectionProps> = ({
  applications,
  value,
  onChange,
  label = "Applications souhaitées",
}) => (
  <Box>
    <Typography variant="subtitle1">{label}</Typography>
    <FormGroup>
      {applications.map((app) => (
        <FormControlLabel
          key={app.name}
          control={
            <Checkbox
              checked={value.includes(app.name)}
              onChange={() => onChange(toggleArrayItem(value, app.name))}
            />
          }
          label={app.pretty_name}
        />
      ))}
    </FormGroup>
  </Box>
);
