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
  selectedTeamId,
  selectedSeasonId,
  onTeamChange,
  onSeasonChange,
}: GenericSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath.includes(path);

  const handleNavigation = (path: string) => {
    if (selectedTeamId && selectedSeasonId) {
      navigate(`/rugby-teams/${selectedTeamId}/${selectedSeasonId}/${path}`);
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
            value={selectedTeamId || ""}
            label="Équipe"
            onChange={(e) => onTeamChange(e.target.value as number)}
          >
            {teams.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Saison</InputLabel>
          <Select
            value={selectedSeasonId || ""}
            label="Saison"
            onChange={(e) => onSeasonChange(e.target.value as number)}
          >
            {seasons.map((season) => (
              <MenuItem key={season.id} value={season.id}>
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
