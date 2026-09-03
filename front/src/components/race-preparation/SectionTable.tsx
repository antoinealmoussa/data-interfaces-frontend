import React, { useMemo, useRef, useState } from "react";
import {
  Box,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import type { Section, ComputedSection } from "../../types/race-preparation/raceTypes";

interface SectionTableProps {
  sections: (Section | ComputedSection)[];
  onUpdate: (updates: {
    section_id: number;
    name?: string | null;
    pace?: number | null;
    actual_pace?: number | null;
  }[]) => void;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  climb: <TrendingUpIcon fontSize="small" sx={{ color: "#FF9800" }} />,
  flat: <HorizontalRuleIcon fontSize="small" sx={{ color: "#4CAF50" }} />,
  descent: <TrendingDownIcon fontSize="small" sx={{ color: "#2196F3" }} />,
  aid_station: <LocalDrinkIcon fontSize="small" sx={{ color: "#9C27B0" }} />,
};

const SECTION_LABELS: Record<string, string> = {
  climb: "Montée",
  flat: "Plat",
  descent: "Descente",
  aid_station: "Ravitaillement",
};

export default function SectionTable({ sections, onUpdate }: SectionTableProps) {
  const [editingName, setEditingName] = useState<Record<number, string>>({});
  const [editingPace, setEditingPace] = useState<Record<number, string>>({});
  const [editingVam, setEditingVam] = useState<Record<number, string>>({});
  const [editingTime, setEditingTime] = useState<Record<number, string>>({});
  const [editingActualTime, setEditingActualTime] = useState<
    Record<number, string>
  >({});
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const focusNextField = (field: string, index: number) => {
    const nextRow = index + 1;
    const nextSection = sections[nextRow];
    if (field === "pace") {
      fieldRefs.current[`vam-${index}`]?.focus();
    } else if (field === "vam" || field === "time") {
      if (!nextSection) return;
      const nextIsAid = nextSection.section_type === "aid_station";
      fieldRefs.current[`${nextIsAid ? "time" : "pace"}-${nextRow}`]?.focus();
    } else if (field === "actualTime") {
      fieldRefs.current[`actualTime-${nextRow}`]?.focus();
    } else {
      fieldRefs.current[`${field}-${nextRow}`]?.focus();
    }
  };

  const cumulative = useMemo(() => {
    return sections.reduce<{
      distCumul: number[];
      dplusCumul: number[];
      dminusCumul: number[];
      timeCumul: number[];
      timeActualCumul: number[];
      vam: number[];
      vamActual: number[];
    }>(
      (acc, s) => {
        const prevDist = acc.distCumul.length > 0 ? acc.distCumul[acc.distCumul.length - 1] : 0;
        const prevDplus = acc.dplusCumul.length > 0 ? acc.dplusCumul[acc.dplusCumul.length - 1] : 0;
        const prevDminus = acc.dminusCumul.length > 0 ? acc.dminusCumul[acc.dminusCumul.length - 1] : 0;
        const prevTime = acc.timeCumul.length > 0 ? acc.timeCumul[acc.timeCumul.length - 1] : 0;
        const prevTimeActual = acc.timeActualCumul.length > 0 ? acc.timeActualCumul[acc.timeActualCumul.length - 1] : 0;

        const sectionTime = s.section_type === "aid_station"
          ? (s.pace ?? 0)
          : s.pace ? (s.distance / 1000) * s.pace : 0;
        const actualTime = s.section_type === "aid_station"
          ? (s.actual_pace ?? 0)
          : s.actual_pace ? (s.distance / 1000) * s.actual_pace : 0;
        const verticalChange =
          s.section_type === "descent" ? -s.elevation_loss : s.elevation_gain;

        acc.distCumul.push(prevDist + s.distance);
        acc.dplusCumul.push(prevDplus + s.elevation_gain);
        acc.dminusCumul.push(prevDminus + s.elevation_loss);
        acc.timeCumul.push(prevTime + sectionTime);
        acc.timeActualCumul.push(prevTimeActual + actualTime);
        acc.vam.push(sectionTime > 0 ? (verticalChange / (sectionTime / 60)) : 0);
        acc.vamActual.push(actualTime > 0 ? (verticalChange / (actualTime / 60)) : 0);
        return acc;
      },
      { distCumul: [], dplusCumul: [], dminusCumul: [], timeCumul: [], timeActualCumul: [], vam: [], vamActual: [] },
    );
  }, [sections]);

  const handleNameChange = (id: number, value: string) => {
    setEditingName((prev) => ({ ...prev, [id]: value }));
  };

  const handleNameBlur = (id: number) => {
    onUpdate([{ section_id: id, name: editingName[id] ?? null }]);
    setEditingName((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handlePaceChange = (id: number, value: string) => {
    setEditingPace((prev) => ({ ...prev, [id]: value }));
  };

  const handlePaceBlur = (id: number) => {
    const raw = editingPace[id];
    const pace = raw === "" || raw === undefined ? null : parseFloat(raw);
    onUpdate([{ section_id: id, pace }]);
    setEditingPace((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleTimeChange = (id: number, value: string) => {
    setEditingTime((prev) => ({ ...prev, [id]: value }));
  };

  const handleVamChange = (id: number, value: string) => {
    setEditingVam((prev) => ({ ...prev, [id]: value }));
  };

  const handleVamBlur = (s: Section | ComputedSection) => {
    const id = s.id;
    if (id === undefined) return;
    const raw = editingVam[id];
    const vam = raw === "" || raw === undefined ? NaN : parseFloat(raw);
    let pace: number | null = null;
    const verticalChange =
      s.section_type === "descent" ? -s.elevation_loss : s.elevation_gain;
    if (!Number.isNaN(vam) && vam !== 0 && s.distance > 0) {
      const sectionTime = (verticalChange * 60) / vam;
      pace = sectionTime / (s.distance / 1000);
    }
    onUpdate([{ section_id: id, pace }]);
    setEditingVam((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleTimeBlur = (id: number) => {
    const raw = editingTime[id];
    const pace = raw === "" || raw === undefined ? null : parseFloat(raw);
    onUpdate([{ section_id: id, pace }]);
    setEditingTime((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleActualTimeChange = (id: number, value: string) => {
    setEditingActualTime((prev) => ({ ...prev, [id]: value }));
  };

  const handleActualTimeBlur = (s: Section | ComputedSection) => {
    const id = s.id;
    if (id === undefined) return;
    const raw = editingActualTime[id];
    const minutes =
      raw === "" || raw === undefined ? null : parseFloat(raw);
    let actual_pace: number | null = null;
    if (minutes !== null) {
      if (s.section_type === "aid_station") {
        actual_pace = minutes;
      } else if (s.distance > 0) {
        actual_pace = minutes / (s.distance / 1000);
      }
    }
    onUpdate([{ section_id: id, actual_pace }]);
    setEditingActualTime((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const formatTime = (minutes: number) => {
    if (minutes === 0) return "-";
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    return h > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${m}min`;
  };

  return (
    <TableContainer
      sx={{
        flex: 1,
        minHeight: 0,
        height: "100%",
        overflow: "auto",
        border: 1,
        borderColor: "divider",
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Nom</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align="right">Distance</TableCell>
            <TableCell align="right">Dist. cumul.</TableCell>
            <TableCell align="right">D+</TableCell>
            <TableCell align="right">D+ cumul.</TableCell>
            <TableCell align="right">D-</TableCell>
            <TableCell align="right">D- cumul.</TableCell>
            <TableCell align="right">Pente %</TableCell>
            <TableCell align="right">Vitesse</TableCell>
            <TableCell align="right">Temps</TableCell>
            <TableCell align="right">Temps cumul.</TableCell>
            <TableCell align="right">VAM</TableCell>
            <TableCell align="right">Vit. réelle</TableCell>
            <TableCell align="right">Temps réel</TableCell>
            <TableCell align="right">VAM réelle</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sections.map((s, i) => (
            <TableRow key={s.id ?? `computed-${i}`}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>
                <TextField
                  size="small"
                  variant="standard"
                  placeholder={SECTION_LABELS[s.section_type]}
                  value={editingName[s.id ?? 0] ?? s.name ?? ""}
                  inputRef={(el) => { fieldRefs.current[`name-${i}`] = el; }}
                  onChange={(e) => { if (s.id) handleNameChange(s.id, e.target.value); }}
                  onBlur={() => { if (s.id) handleNameBlur(s.id); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && s.id) {
                      handleNameBlur(s.id);
                      focusNextField("name", i);
                    }
                  }}
                  sx={{ minWidth: 120 }}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {SECTION_ICONS[s.section_type]}
                  <Typography variant="caption">
                    {SECTION_LABELS[s.section_type]}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                {(s.distance / 1000).toFixed(2)} km
              </TableCell>
              <TableCell align="right">
                {(cumulative.distCumul[i] / 1000).toFixed(2)} km
              </TableCell>
              <TableCell align="right">
                {s.elevation_gain.toFixed(0)} m
              </TableCell>
              <TableCell align="right">
                {cumulative.dplusCumul[i].toFixed(0)} m
              </TableCell>
              <TableCell align="right">
                {s.elevation_loss.toFixed(0)} m
              </TableCell>
              <TableCell align="right">
                {cumulative.dminusCumul[i].toFixed(0)} m
              </TableCell>
              <TableCell align="right">
                {s.average_gradient.toFixed(1)}%
              </TableCell>
              <TableCell align="right">
                <TextField
                  size="small"
                  variant="standard"
                  disabled={s.section_type === "aid_station"}
                  placeholder={getDefaultPace(s.section_type)}
                  value={
                    s.section_type === "aid_station"
                      ? "0"
                      : editingPace[s.id ?? 0] ?? s.pace?.toString() ?? ""
                  }
                  inputRef={(el) => { fieldRefs.current[`pace-${i}`] = el; }}
                  onChange={(e) => { if (s.id) handlePaceChange(s.id, e.target.value); }}
                  onBlur={() => { if (s.id) handlePaceBlur(s.id); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && s.id) {
                      handlePaceBlur(s.id);
                      focusNextField("pace", i);
                    }
                  }}
                  sx={{ width: 60 }}
                  inputProps={{ style: { textAlign: "right" } }}
                />
              </TableCell>
              <TableCell align="right">
                {s.section_type === "aid_station" ? (
                  <TextField
                    size="small"
                    variant="standard"
                    placeholder="min"
                    value={editingTime[s.id ?? 0] ?? (s.pace ?? 0).toString()}
                    inputRef={(el) => { fieldRefs.current[`time-${i}`] = el; }}
                    onChange={(e) => { if (s.id) handleTimeChange(s.id, e.target.value); }}
                    onBlur={() => { if (s.id) handleTimeBlur(s.id); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && s.id) {
                        handleTimeBlur(s.id);
                        focusNextField("time", i);
                      }
                    }}
                    sx={{ width: 90 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">min</InputAdornment>
                      ),
                      inputProps: { style: { textAlign: "right" } },
                    }}
                  />
                ) : (
                  formatTime(cumulative.timeCumul[i] - (i > 0 ? cumulative.timeCumul[i - 1] : 0))
                )}
              </TableCell>
              <TableCell align="right">
                {formatTime(cumulative.timeCumul[i])}
              </TableCell>
              <TableCell align="right">
                {s.section_type === "aid_station" ? (
                  "-"
                ) : (
                  <TextField
                    size="small"
                    variant="standard"
                    placeholder="m/h"
                    value={
                      editingVam[s.id ?? 0] ??
                      (cumulative.vam[i] !== 0
                        ? cumulative.vam[i].toFixed(0)
                        : "")
                    }
                    inputRef={(el) => { fieldRefs.current[`vam-${i}`] = el; }}
                    onChange={(e) => { if (s.id) handleVamChange(s.id, e.target.value); }}
                    onBlur={() => handleVamBlur(s)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleVamBlur(s);
                        focusNextField("vam", i);
                      }
                    }}
                    sx={{ width: 90 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">m/h</InputAdornment>
                      ),
                      inputProps: { style: { textAlign: "right" } },
                    }}
                  />
                )}
              </TableCell>
              <TableCell align="right">
                {s.section_type === "aid_station"
                  ? "0"
                  : s.actual_pace != null
                    ? s.actual_pace.toFixed(1)
                    : "-"}
              </TableCell>
              <TableCell align="right">
                <TextField
                  size="small"
                  variant="standard"
                  value={
                    editingActualTime[s.id ?? 0] ??
                    (s.section_type === "aid_station"
                      ? (s.actual_pace ?? 0).toString()
                      : s.actual_pace != null
                        ? ((s.distance / 1000) * s.actual_pace).toFixed(0)
                        : "")
                  }
                  inputRef={(el) => { fieldRefs.current[`actualTime-${i}`] = el; }}
                  onChange={(e) => { if (s.id) handleActualTimeChange(s.id, e.target.value); }}
                  onBlur={() => handleActualTimeBlur(s)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleActualTimeBlur(s);
                      focusNextField("actualTime", i);
                    }
                  }}
                  sx={{ width: 90 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">min</InputAdornment>
                    ),
                    inputProps: { style: { textAlign: "right" } },
                  }}
                />
              </TableCell>
              <TableCell align="right">
                {cumulative.vamActual[i] !== 0
                  ? `${cumulative.vamActual[i].toFixed(0)} m/h`
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function getDefaultPace(sectionType: string): string {
  switch (sectionType) {
    case "climb":
      return "9.0";
    case "flat":
      return "5.5";
    case "descent":
      return "7.0";
    case "aid_station":
      return "0";
    default:
      return "";
  }
}
