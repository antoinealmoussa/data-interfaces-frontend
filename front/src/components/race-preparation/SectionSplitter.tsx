import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import PlaceIcon from "@mui/icons-material/Place";
import LocalDrinkIcon from "@mui/icons-material/LocalDrink";
import CalculateIcon from "@mui/icons-material/Calculate";
import ElevationProfile from "./ElevationProfile";
import TrailMap from "./TrailMap";
import SectionTable from "./SectionTable";
import {
  useCalculateSections,
  useUpdateSections,
} from "../../hooks/race-preparation/useRacePreparation";
import type {
  TrackPoint,
  Section,
  ComputedSection,
  Marker,
} from "../../types/race-preparation/raceTypes";

const MIN_MARKER_DISTANCE = 50;

interface SectionSplitterProps {
  raceId: number;
  trackPoints: TrackPoint[];
  sections: Section[];
}

function buildMarkersFromSections(
  sections: Section[],
  totalDistance: number,
): Marker[] {
  const markers: Marker[] = [];
  let localKey = 0;
  for (const s of sections) {
    if (s.section_type === "aid_station") {
      localKey += 1;
      markers.push({
        key: `loaded-${s.id}`,
        distance: s.start_distance,
        type: "aid_station",
        waitTime: s.pace ?? 0,
      });
    } else if (
      s.start_distance > 0 &&
      (totalDistance <= 0 || s.start_distance < totalDistance)
    ) {
      localKey += 1;
      markers.push({
        key: `loaded-boundary-${localKey}`,
        distance: s.start_distance,
        type: "boundary",
        waitTime: null,
      });
    }
  }
  return markers;
}

export default function SectionSplitter({
  raceId,
  trackPoints,
  sections,
}: SectionSplitterProps) {
  const [markers, setMarkers] = useState<Marker[]>(() =>
    buildMarkersFromSections(sections, trackPoints.length > 0 ? trackPoints[trackPoints.length - 1].distance : 0),
  );
  const [markerMode, setMarkerMode] = useState<"boundary" | "aid_station">("boundary");
  const [hoverDistance, setHoverDistance] = useState<number | null>(null);
  const [computedSections, setComputedSections] = useState<ComputedSection[] | null>(
    () =>
      sections.length > 0
        ? sections.map((s) => ({ ...s, section_type: s.section_type }))
        : null,
  );
  const calculateSections = useCalculateSections(raceId);
  const updateSections = useUpdateSections(raceId);
  const localKeyCounter = useRef(0);
  const calculateRef = useRef(calculateSections);
  const [prevSections, setPrevSections] = useState(sections);
  if (sections !== prevSections) {
    setPrevSections(sections);
    if (sections.length > 0) {
      setComputedSections(
        sections.map((s) => ({ ...s, section_type: s.section_type })),
      );
    }
  }

  useEffect(() => {
    calculateRef.current = calculateSections;
  }, [calculateSections]);

  const totalDistance = useMemo(() => {
    if (trackPoints.length === 0) return 0;
    return trackPoints[trackPoints.length - 1].distance;
  }, [trackPoints]);

  const handleMarkerAdd = useCallback(
    (distance: number) => {
      if (distance <= 0 || distance >= totalDistance) return;
      const tooClose = markers.some(
        (m) => Math.abs(m.distance - distance) < MIN_MARKER_DISTANCE,
      );
      if (tooClose) return;
      localKeyCounter.current += 1;
      const newMarker: Marker = {
        key: `local-${localKeyCounter.current}`,
        distance,
        type: markerMode,
        waitTime: markerMode === "aid_station" ? 0 : null,
      };
      setMarkers((prev) => [...prev, newMarker]);
      if (markerMode === "aid_station") {
        setComputedSections(null);
      }
    },
    [markers, markerMode, totalDistance],
  );

  const handleMarkerMove = useCallback(
    (key: string, distance: number) => {
      setMarkers((prev) =>
        prev.map((m) => (m.key === key ? { ...m, distance } : m)),
      );
      setComputedSections(null);
    },
    [],
  );

  const handleMarkerRemove = useCallback((key: string) => {
    setMarkers((prev) => prev.filter((m) => m.key !== key));
    setComputedSections(null);
  }, []);

  const handleCalculate = useCallback(() => {
    const request = {
      markers: markers.map((m) => ({
        distance: m.distance,
        marker_type: m.type,
        wait_time: m.waitTime,
      })),
    };
    calculateRef.current.mutate(request, {
      onSuccess: (race) => {
        setComputedSections(
          race.sections.map((s) => ({
            ...s,
            section_type: s.section_type,
          })),
        );
        setMarkers(buildMarkersFromSections(race.sections, totalDistance));
      },
    });
  }, [markers, totalDistance]);

  const handleUpdate = useCallback(
    (updates: { section_id: number; name?: string | null; pace?: number | null; actual_pace?: number | null }[]) => {
      updateSections.mutate({ sections: updates });
    },
    [updateSections],
  );

  const sectionTableSections = useMemo(() => {
    if (!computedSections) return [];
    return computedSections;
  }, [computedSections]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
        <Box sx={{ flex: 2, overflow: "hidden" }}>
          <ElevationProfile
            trackPoints={trackPoints}
            markers={markers}
            onMarkerAdd={handleMarkerAdd}
            onMarkerMove={handleMarkerMove}
            onMarkerRemove={handleMarkerRemove}
            onHover={setHoverDistance}
            computedSections={computedSections ?? undefined}
            markerMode={markerMode}
          />
        </Box>
        <Box sx={{ flex: 1, height: 300 }}>
          <TrailMap
            trackPoints={trackPoints}
            sections={sections}
            hoverDistance={hoverDistance}
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <ToggleButtonGroup
          value={markerMode}
          exclusive
          onChange={(_, val) => { if (val) setMarkerMode(val); }}
          size="small"
        >
          <ToggleButton value="boundary">
            <PlaceIcon fontSize="small" sx={{ mr: 0.5 }} />
            Limite
          </ToggleButton>
          <ToggleButton value="aid_station">
            <LocalDrinkIcon fontSize="small" sx={{ mr: 0.5 }} />
            Ravitaillement
          </ToggleButton>
        </ToggleButtonGroup>

        <Typography variant="caption" color="text.secondary">
          Cliquez sur le profil pour placer un marqueur.
          Glissez pour déplacer. Clic droit pour supprimer.
        </Typography>

        <Box sx={{ flex: 1 }} />

        <Button
          size="small"
          variant="contained"
          startIcon={<CalculateIcon />}
          onClick={handleCalculate}
          disabled={calculateSections.isPending}
        >
          Calculer les sections
        </Button>
      </Box>

      {sectionTableSections.length > 0 && (
        <Box
          sx={{
            mt: 1,
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <SectionTable sections={sectionTableSections} onUpdate={handleUpdate} />
        </Box>
      )}
    </Box>
  );
}