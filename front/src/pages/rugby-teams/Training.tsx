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
  Paper,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTeamAndSeason } from "../../hooks/useTeamAndSeason";
import { playerApi } from "../../api/playerApi";
import { trainingApi } from "../../api/trainingApi";
import type { Player } from "../../types/playerTypes";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { TrainingTeam, DistributeRequest } from "../../api/trainingApi";
import { PageGuard } from "../../components/common/PageGuard";

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

const TeamCard = ({
  team,
  isOver,
}: {
  team: TrainingTeam;
  isOver: boolean;
}) => (
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
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [teamCount, setTeamCount] = useState(2);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("");
  const [trainingTeams, setTrainingTeams] = useState<TrainingTeam[] | null>(
    null,
  );
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);

  const { data: players = [], isLoading: playersLoading } = useQuery({
    queryKey: ["players", team?.name],
    queryFn: () =>
      playerApi
        .getByTeam(team!.name)
        .then((data) => data.sort((a, b) => a.name.localeCompare(b.name))),
    enabled: !!team,
  });

  const { data: algorithms = [] } = useQuery({
    queryKey: ["algorithms", team?.name],
    queryFn: () => trainingApi.getAlgorithms(team!.name),
    enabled: !!team,
  });

  useEffect(() => {
    if (algorithms.length > 0 && !selectedAlgorithm) {
      setSelectedAlgorithm(algorithms[0].id);
    }
  }, [algorithms, selectedAlgorithm]);

  const distributeMutation = useMutation({
    mutationFn: (req: DistributeRequest) =>
      trainingApi.distribute(team!.name, req),
    onSuccess: (data) => setTrainingTeams(data.teams),
  });

  const handleTogglePlayer = (playerId: number) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
  };

  const handleGenerate = () => {
    if (!team || selectedPlayerIds.length < 2 || !selectedAlgorithm) return;
    distributeMutation.mutate({
      player_ids: selectedPlayerIds,
      team_count: teamCount,
      algorithm: selectedAlgorithm,
    });
  };

  const findPlayer = (id: string): Player | null => {
    if (!trainingTeams) return null;
    const playerId = Number(String(id).replace("player-", ""));
    for (const t of trainingTeams) {
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
    const movedPlayer = findPlayer(String(active.id));
    if (!movedPlayer) return;

    setTrainingTeams((prev) => {
      if (!prev) return prev;
      const sourceTeam = prev.find((t) =>
        t.players.some((p) => p.id === playerId),
      );
      if (!sourceTeam) return prev;
      return prev.map((t) =>
        t.id === sourceTeam.id
          ? { ...t, players: t.players.filter((p) => p.id !== playerId) }
          : t.id === targetTeamId
            ? { ...t, players: [...t.players, movedPlayer] }
            : t,
      );
    });
  };

  return (
    <PageGuard
      loading={loading || playersLoading}
      error={
        error || (!team || !season ? "Équipe ou saison introuvable" : null)
      }
    >
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
              disabled={
                selectedPlayerIds.length < 2 ||
                distributeMutation.isPending ||
                !selectedAlgorithm
              }
              onClick={handleGenerate}
            >
              {distributeMutation.isPending
                ? "Génération..."
                : "Générer les équipes"}
            </Button>
          </Box>
        </Box>

        {trainingTeams && (
          <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography variant="h6">Équipes constituées</Typography>
              <Button variant="outlined" size="small" onClick={handleGenerate}>
                Regénérer
              </Button>
            </Box>

            <DndContext
              onDragStart={(e) =>
                setActivePlayer(findPlayer(String(e.active.id)))
              }
              onDragEnd={handleDragEnd}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                }}
              >
                {trainingTeams.map((team) => (
                  <TeamDroppable key={team.id} team={team} />
                ))}
              </Box>
              <DragOverlay>
                {activePlayer ? (
                  <Paper
                    sx={{
                      p: 1,
                      bgcolor: "background.paper",
                      borderRadius: 1,
                      boxShadow: 3,
                    }}
                  >
                    {activePlayer.name}
                  </Paper>
                ) : null}
              </DragOverlay>
            </DndContext>
          </Box>
        )}
      </Box>
    </PageGuard>
  );
};
