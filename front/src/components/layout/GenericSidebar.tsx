import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { type GenericSidebarProps } from "../../types/uiTypes";

export const GenericSidebar = ({
  items,
  teams,
  seasons,
  selectedTeamName,
  selectedSeasonName,
  onTeamChange,
  onSeasonChange,
}: GenericSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath.includes(path);

  const handleNavigation = (path: string) => {
    if (selectedTeamName && selectedSeasonName) {
      navigate(
        `/rugby-teams/${encodeURIComponent(selectedTeamName)}/${encodeURIComponent(selectedSeasonName)}/${path}`,
      );
    }
  };

  return (
    <Box
      sx={{
        width: 240,
        bgcolor: "background.paper",
        height: "100%",
        borderRight: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ p: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Équipe</InputLabel>
          <Select
            value={selectedTeamName || ""}
            label="Équipe"
            onChange={(e) => onTeamChange(e.target.value as string)}
          >
            {teams.map((team) => (
              <MenuItem key={team.id} value={team.name}>
                {team.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Saison</InputLabel>
          <Select
            value={selectedSeasonName || ""}
            label="Saison"
            onChange={(e) => onSeasonChange(e.target.value as string)}
          >
            {seasons.map((season) => (
              <MenuItem key={season.id} value={season.name}>
                {season.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider />

      <List>
        {items.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
