import { useCallback, useMemo, useRef, useState } from "react";
import type { TrackPoint, ComputedSection, Marker } from "../../types/race-preparation/raceTypes";

const SECTION_COLORS: Record<string, string> = {
  climb: "#FF9800",
  flat: "#4CAF50",
  descent: "#2196F3",
  aid_station: "#9C27B0",
};

interface ElevationProfileProps {
  trackPoints: TrackPoint[];
  markers: Marker[];
  onMarkerAdd: (distance: number) => void;
  onMarkerMove: (key: string, distance: number) => void;
  onMarkerRemove: (key: string) => void;
  onHover?: (distance: number | null) => void;
  computedSections?: ComputedSection[];
  markerMode?: "boundary" | "aid_station";
}

const PADDING = { top: 20, right: 30, bottom: 40, left: 60 };
const WIDTH = 900;
const HEIGHT = 300;

const GRADIENT_COLORS: [number, string][] = [
  [-26, "#795548"],
  [-16, "#F44336"],
  [-7, "#FF9800"],
  [-3, "#FFC107"],
  [3, "#4CAF50"],
  [7, "#FFC107"],
  [16, "#FF9800"],
  [26, "#F44336"],
  [Infinity, "#795548"],
];

function getGradientColor(gradient: number): string {
  for (const [threshold, color] of GRADIENT_COLORS) {
    if (gradient <= threshold) return color;
  }
  return "#795548";
}

function computeGradient(p1: TrackPoint, p2: TrackPoint): number {
  const dist = p2.distance - p1.distance;
  if (dist === 0) return 0;
  return ((p2.elevation - p1.elevation) / dist) * 100;
}

export default function ElevationProfile({
  trackPoints,
  markers,
  onMarkerAdd,
  onMarkerMove,
  onMarkerRemove,
  onHover,
  computedSections = [],
  markerMode = "boundary",
}: ElevationProfileProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    distance: number;
    elevation: number;
    gradient: number;
  } | null>(null);

  const { xScale, yScale } = useMemo(() => {
    if (trackPoints.length === 0) {
      return { xScale: () => 0, yScale: () => 0 };
    }
    const maxDist = trackPoints[trackPoints.length - 1].distance;
    const minElev = Math.min(...trackPoints.map((p) => p.elevation));
    const maxElev = Math.max(...trackPoints.map((p) => p.elevation));
    const elevRange = maxElev - minElev || 100;
    const pw = WIDTH - PADDING.left - PADDING.right;
    const ph = HEIGHT - PADDING.top - PADDING.bottom;
    return {
      xScale: (d: number) => PADDING.left + (d / maxDist) * pw,
      yScale: (e: number) => PADDING.top + ph - ((e - minElev) / elevRange) * ph,
    };
  }, [trackPoints]);

  const buildPath = useCallback(() => {
    if (trackPoints.length === 0) return "";
    const pts = trackPoints.map(
      (p) => `${xScale(p.distance)},${yScale(p.elevation)}`,
    );
    return `M${pts.join("L")}`;
  }, [trackPoints, xScale, yScale]);

  const buildGradientSegments = useMemo(() => {
    if (trackPoints.length < 2) return [];
    const segments: { d: string; color: string }[] = [];
    for (let i = 0; i < trackPoints.length - 1; i++) {
      const p1 = trackPoints[i];
      const p2 = trackPoints[i + 1];
      const grad = computeGradient(p1, p2);
      const color = getGradientColor(grad);
      const x1 = xScale(p1.distance);
      const y1 = yScale(p1.elevation);
      const x2 = xScale(p2.distance);
      const y2 = yScale(p2.elevation);
      const baseline = yScale(
        Math.min(...trackPoints.map((p) => p.elevation)),
      );
      segments.push({
        d: `M${x1},${y1}L${x2},${y2}L${x2},${baseline}L${x1},${baseline}Z`,
        color,
      });
    }
    return segments;
  }, [trackPoints, xScale, yScale]);

  const maxDist = useMemo(
    () => (trackPoints.length > 0 ? trackPoints[trackPoints.length - 1].distance : 0),
    [trackPoints],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || trackPoints.length === 0) return;
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = e.clientX - rect.left;
      const pw = WIDTH - PADDING.left - PADDING.right;
      const dist = ((svgX - PADDING.left) / pw) * maxDist;

      if (dragging !== null) {
        const clamped = Math.max(0, Math.min(maxDist, dist));
        onMarkerMove(dragging, clamped);
        return;
      }

      let closest = trackPoints[0];
      let minDiff = Math.abs(dist - closest.distance);
      for (const tp of trackPoints) {
        const diff = Math.abs(dist - tp.distance);
        if (diff < minDiff) {
          minDiff = diff;
          closest = tp;
        }
      }

      const idx = trackPoints.indexOf(closest);
      const grad =
        idx > 0 ? computeGradient(trackPoints[idx - 1], closest) : 0;

      setTooltip({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        distance: closest.distance,
        elevation: closest.elevation,
        gradient: grad,
      });
      onHover?.(closest.distance);
    },
    [trackPoints, dragging, maxDist, onMarkerMove, onHover],
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || trackPoints.length === 0 || dragging !== null)
        return;
      const rect = svgRef.current.getBoundingClientRect();
      const svgX = e.clientX - rect.left;
      const pw = WIDTH - PADDING.left - PADDING.right;
      const dist = ((svgX - PADDING.left) / pw) * maxDist;
      if (dist < 0 || dist > maxDist) return;
      onMarkerAdd(dist);
    },
    [trackPoints, dragging, maxDist, onMarkerAdd],
  );

  const handleMarkerMouseDown = useCallback(
    (e: React.MouseEvent, key: string) => {
      e.stopPropagation();
      setDragging(key);
    },
    [],
  );

  const handleMarkerContextMenu = useCallback(
    (e: React.MouseEvent, key: string) => {
      e.preventDefault();
      e.stopPropagation();
      onMarkerRemove(key);
    },
    [onMarkerRemove],
  );

  const sortedMarkers = useMemo(
    () => [...markers].sort((a, b) => a.distance - b.distance),
    [markers],
  );

  const sectionBands = useMemo(() => {
    if (computedSections.length === 0) return [];
    const baseline = trackPoints.length > 0
      ? yScale(Math.min(...trackPoints.map((p) => p.elevation)))
      : HEIGHT - PADDING.bottom;
    return computedSections.map((s) => {
      const x1 = xScale(s.start_distance);
      const x2 = xScale(s.end_distance);
      const color = SECTION_COLORS[s.section_type] ?? "#999";
      return { x1, x2, width: x2 - x1, color, baseline };
    });
  }, [computedSections, trackPoints, xScale, yScale]);

  const xTicks = useMemo(() => {
    if (trackPoints.length === 0) return [];
    const step = Math.ceil(maxDist / 1000 / 5) * 5000;
    const ticks: number[] = [];
    for (let d = 0; d <= maxDist; d += step) ticks.push(d);
    return ticks;
  }, [trackPoints, maxDist]);

  const yTicks = useMemo(() => {
    if (trackPoints.length === 0) return [];
    const minElev = Math.min(...trackPoints.map((p) => p.elevation));
    const maxElev = Math.max(...trackPoints.map((p) => p.elevation));
    const step = Math.ceil((maxElev - minElev) / 4 / 100) * 100 || 100;
    const ticks: number[] = [];
    for (let e = Math.floor(minElev / step) * step; e <= maxElev; e += step)
      ticks.push(e);
    return ticks;
  }, [trackPoints]);

  return (
    <svg
      ref={svgRef}
      width={WIDTH}
      height={HEIGHT}
      style={{ cursor: dragging !== null ? "grabbing" : markerMode === "aid_station" ? "cell" : "crosshair" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setTooltip(null);
        onHover?.(null);
      }}
      onClick={handleClick}
    >
      <g>
        {buildGradientSegments.map((seg, i) => (
          <path key={i} d={seg.d} fill={seg.color} opacity={0.7} />
        ))}
      </g>

      {sectionBands.map((band, i) => (
        <rect
          key={`band-${i}`}
          x={band.x1}
          y={PADDING.top}
          width={band.width}
          height={band.baseline - PADDING.top}
          fill={band.color}
          opacity={0.25}
        />
      ))}

      <path
        d={buildPath()}
        fill="none"
        stroke="#333"
        strokeWidth={1.5}
      />

      {xTicks.map((d) => (
        <g key={`x-${d}`}>
          <line
            x1={xScale(d)}
            y1={PADDING.top}
            x2={xScale(d)}
            y2={HEIGHT - PADDING.bottom}
            stroke="#ddd"
            strokeDasharray="4,4"
          />
          <text
            x={xScale(d)}
            y={HEIGHT - PADDING.bottom + 15}
            textAnchor="middle"
            fontSize={10}
            fill="#666"
          >
            {(d / 1000).toFixed(0)}km
          </text>
        </g>
      ))}

      {yTicks.map((e) => (
        <g key={`y-${e}`}>
          <line
            x1={PADDING.left}
            y1={yScale(e)}
            x2={WIDTH - PADDING.right}
            y2={yScale(e)}
            stroke="#ddd"
            strokeDasharray="4,4"
          />
          <text
            x={PADDING.left - 5}
            y={yScale(e) + 4}
            textAnchor="end"
            fontSize={10}
            fill="#666"
          >
            {e}m
          </text>
        </g>
      ))}

      {sortedMarkers.map((m) => {
        const isBoundary = m.type === "boundary";
        const color = isBoundary ? "#2196F3" : "#9C27B0";
        return (
          <g key={m.key}>
            <line
              x1={xScale(m.distance)}
              y1={PADDING.top}
              x2={xScale(m.distance)}
              y2={HEIGHT - PADDING.bottom}
              stroke={color}
              strokeWidth={isBoundary ? 2 : 1.5}
              strokeDasharray={isBoundary ? "6,3" : "3,3"}
            />
            <circle
              cx={xScale(m.distance)}
              cy={PADDING.top}
              r={5}
              fill={color}
              stroke="white"
              strokeWidth={2}
              style={{ cursor: "grab" }}
              onMouseDown={(e) => handleMarkerMouseDown(e, m.key)}
              onContextMenu={(e) => handleMarkerContextMenu(e, m.key)}
            >
              <title>
                {isBoundary
                  ? `Limite — ${(m.distance / 1000).toFixed(2)} km — clic droit pour supprimer`
                  : `Ravitaillement — ${(m.distance / 1000).toFixed(2)} km — clic droit pour supprimer`}
              </title>
            </circle>
          </g>
        );
      })}

      {tooltip && (
        <g>
          <line
            x1={xScale(tooltip.distance)}
            y1={PADDING.top}
            x2={xScale(tooltip.distance)}
            y2={HEIGHT - PADDING.bottom}
            stroke="#999"
            strokeWidth={1}
          />
          <rect
            x={Math.min(tooltip.x + 10, WIDTH - 150)}
            y={Math.max(tooltip.y - 60, 0)}
            width={140}
            height={50}
            rx={4}
            fill="rgba(0,0,0,0.8)"
          />
          <text
            x={Math.min(tooltip.x + 16, WIDTH - 144)}
            y={Math.max(tooltip.y - 44, 16)}
            fontSize={11}
            fill="white"
          >
            {`${(tooltip.distance / 1000).toFixed(2)} km — ${tooltip.elevation.toFixed(0)} m`}
          </text>
          <text
            x={Math.min(tooltip.x + 16, WIDTH - 144)}
            y={Math.max(tooltip.y - 28, 32)}
            fontSize={11}
            fill="white"
          >
            Pente: {tooltip.gradient.toFixed(1)}%
          </text>
        </g>
      )}
    </svg>
  );
}