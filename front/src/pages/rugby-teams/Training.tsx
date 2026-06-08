import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { useTeamAndSeason } from "../../hooks/useTeamAndSeason";
import { playerApi } from "../../api/playerApi";
import { trainingApi, type AlgorithmInfo } from "../../api/trainingApi";
import type { Player } from "../../types/playerTypes";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";

interface TrainingTeam {
  id: number;
  name: string;
  players: Player[];
}

const DraggablePlayer = ({ player }: { player: Player }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `player-${player.id}`,
  });

  return (
    <ListItem
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      disablePadding
      sx={{
        opacity: isDragging ? 0.4 : 1,
        cursor: "grab",
        "&:active": { cursor: "grabbing" },
        borderRadius: 1,
        px: 1,
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <ListItemText primary={player.name} />
    </ListItem>
  );
};

const TeamCard = ({ team, isOver }: { team: TrainingTeam; isOver: boolean }) => (
  <Card
    sx={{
      outline: isOver ? "2px solid" : undefined,
      outlineColor: isOver ? "primary.main" : undefined,
      bgcolor: isOver ? "action.hover" : undefined,
    }}
  >
    <CardHeader
      title={team.name}
      titleTypographyProps={{ variant: "subtitle1" }}
    />
    <CardContent sx={{ pt: 0 }}>
      <List dense disablePadding>
        {team.players.map((player) => (
          <DraggablePlayer key={player.id} player={player} />
        ))}
      </List>
    </CardContent>
  </Card>
);

const TeamDroppable = ({ team }: { team: TrainingTeam }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `team-${team.id}` });
  return (
    <Box ref={setNodeRef}>
      <TeamCard team={team} isOver={isOver} />
    </Box>
  );
};

export const Training = () => {
  const { team, season, loading, error } = useTeamAndSeason();
  const [players, setPlayers] = useState<Player[]>([]);
  const [playersLoading, setPlayersLoading] = useState(true);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [teamCount, setTeamCount] = useState(2);
  const [algorithms, setAlgorithms] = useState<AlgorithmInfo[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("");
  const [teams, setTeams] = useState<TrainingTeam[] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);

  const loadPlayers = useCallback(async () => {
    if (!team) return;
    setPlayersLoading(true);
    try {
      const res = await playerApi.getByTeam(team.name);
      setPlayers(res.data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      // Silently fail
    } finally {
      setPlayersLoading(false);
    }
  }, [team]);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  useEffect(() => {
    if (!team) return;
    trainingApi.getAlgorithms(team.name).then((res) => {
      setAlgorithms(res.data);
      if (res.data.length > 0) setSelectedAlgorithm(res.data[0].id);
    });
  }, [team]);

  const handleTogglePlayer = (playerId: number) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
  };

  const handleGenerate = async () => {
    if (!team || selectedPlayerIds.length < 2 || !selectedAlgorithm) return;
    setGenerating(true);
    try {
      const res = await trainingApi.distribute(team.name, {
        player_ids: selectedPlayerIds,
        team_count: teamCount,
        algorithm: selectedAlgorithm,
      });
      setTeams(res.data.teams);
    } catch {
      // Silently fail
    } finally {
      setGenerating(false);
    }
  };

  const findPlayer = (id: string): Player | null => {
    if (!teams) return null;
    const playerId = Number(String(id).replace("player-", ""));
    for (const t of teams) {
      const found = t.players.find((p) => p.id === playerId);
      if (found) return found;
    }
    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActivePlayer(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const playerId = Number(String(active.id).replace("player-", ""));
    const targetTeamId = Number(String(over.id).replace("team-", ""));

    setTeams((prev) => {
      if (!prev) return prev;
      let movedPlayer: Player | null = null;
      const updated = prev.map((t) => {
        const found = t.players.find((p) => p.id === playerId);
        if (found) {
          movedPlayer = found;
          return { ...t, players: t.players.filter((p) => p.id !== playerId) };
        }
        return t;
      });
      if (movedPlayer) {
        return updated.map((t) =>
          t.id === targetTeamId
            ? { ...t, players: [...t.players, movedPlayer!] }
            : t,
        );
      }
      return prev;
    });
  };

  if (loading || playersLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !team || !season) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          {error || "Équipe ou saison introuvable"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        gap: 3,
        alignItems: "stretch",
        height: "100%",
      }}
    >
      <Box
        sx={{
          width: 350,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <FormControl
          component="fieldset"
          sx={{
            mb: 2,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
          }}
        >
          <FormLabel component="legend">
            Joueurs présents ({selectedPlayerIds.length})
          </FormLabel>
          <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
            <FormGroup>
              {players.map((player) => (
                <FormControlLabel
                  key={player.id}
                  control={
                    <Checkbox
                      checked={selectedPlayerIds.includes(player.id)}
                      onChange={() => handleTogglePlayer(player.id)}
                    />
                  }
                  label={player.name}
                />
              ))}
            </FormGroup>
          </Box>
        </FormControl>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: "0 0 auto",
          }}
        >
          <TextField
            label="Nombre d'équipes"
            type="number"
            value={teamCount}
            onChange={(e) => {
              const val = Math.max(
                1,
                Math.min(6, parseInt(e.target.value) || 1),
              );
              setTeamCount(val);
            }}
            slotProps={{
              htmlInput: { min: 1, max: 6 },
            }}
            sx={{ mb: 2, width: "100%" }}
          />

          <FormControl sx={{ mb: 2, width: "100%" }}>
            <InputLabel>Mode de sélection</InputLabel>
            <Select
              value={selectedAlgorithm}
              label="Mode de sélection"
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
            >
              {algorithms.map((algo) => (
                <MenuItem key={algo.id} value={algo.id}>
                  {algo.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            fullWidth
            disabled={selectedPlayerIds.length < 2 || generating || !selectedAlgorithm}
            onClick={handleGenerate}
          >
            {generating ? "Génération..." : "Générer les équipes"}
          </Button>
        </Box>
      </Box>

      {teams && (
        <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Typography variant="h6">Équipes constituées</Typography>
            <Button variant="outlined" size="small" onClick={handleGenerate}>
              Regénérer
            </Button>
          </Box>

          <DndContext
            onDragStart={(e) => setActivePlayer(findPlayer(String(e.active.id)))}
            onDragEnd={handleDragEnd}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
              }}
            >
              {teams.map((team) => (
                <TeamDroppable key={team.id} team={team} />
              ))}
            </Box>
            <DragOverlay>
              {activePlayer ? (
                <Paper sx={{ p: 1, bgcolor: "background.paper", borderRadius: 1, boxShadow: 3 }}>
                  {activePlayer.name}
                </Paper>
              ) : null}
            </DragOverlay>
          </DndContext>
        </Box>
      )}
    </Box>
  );
};
