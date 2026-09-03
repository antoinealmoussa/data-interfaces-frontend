import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import type { TrackPoint } from "../../types/race-preparation/raceTypes";
import type { Section } from "../../types/race-preparation/raceTypes";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface TrailMapProps {
  trackPoints: TrackPoint[];
  sections: Section[];
  hoverDistance: number | null;
}

const SECTION_COLORS: Record<string, string> = {
  climb: "#FF9800",
  flat: "#4CAF50",
  descent: "#2196F3",
  aid_station: "#9C27B0",
};

function computeGradient(p1: TrackPoint, p2: TrackPoint): number {
  const dist = p2.distance - p1.distance;
  if (dist === 0) return 0;
  return ((p2.elevation - p1.elevation) / dist) * 100;
}

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

function findInterpolatedPoint(
  trackPoints: TrackPoint[],
  distance: number,
): TrackPoint | null {
  if (trackPoints.length === 0) return null;
  if (distance <= trackPoints[0].distance) return trackPoints[0];
  if (distance >= trackPoints[trackPoints.length - 1].distance)
    return trackPoints[trackPoints.length - 1];

  for (let i = 1; i < trackPoints.length; i++) {
    const p1 = trackPoints[i - 1];
    const p2 = trackPoints[i];
    if (distance >= p1.distance && distance <= p2.distance) {
      const seg = p2.distance - p1.distance;
      if (seg === 0) return p1;
      const ratio = (distance - p1.distance) / seg;
      return {
        lat: p1.lat + ratio * (p2.lat - p1.lat),
        lon: p1.lon + ratio * (p2.lon - p1.lon),
        elevation: p1.elevation + ratio * (p2.elevation - p1.elevation),
        distance,
      };
    }
  }
  return trackPoints[trackPoints.length - 1];
}

function HoverMarker({
  trackPoints,
  hoverDistance,
}: {
  trackPoints: TrackPoint[];
  hoverDistance: number;
}) {
  const map = useMap();
  const markerRef = useRef<L.CircleMarker | null>(null);

  useEffect(() => {
    const pt = findInterpolatedPoint(trackPoints, hoverDistance);
    if (!pt) return;

    if (!markerRef.current) {
      markerRef.current = L.circleMarker([pt.lat, pt.lon], {
        radius: 6,
        color: "#F44336",
        fillColor: "white",
        fillOpacity: 1,
        weight: 2,
      }).addTo(map);
    } else {
      markerRef.current.setLatLng([pt.lat, pt.lon]);
    }
  }, [trackPoints, hoverDistance, map]);

  useEffect(() => {
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, []);

  return null;
}

function FitBounds({ trackPoints }: { trackPoints: TrackPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (trackPoints.length === 0) return;
    const bounds = L.latLngBounds(
      trackPoints.map((p) => [p.lat, p.lon] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [trackPoints, map]);

  return null;
}

export default function TrailMap({
  trackPoints,
  sections,
  hoverDistance,
}: TrailMapProps) {
  const gradientPolylines = useMemo(() => {
    if (trackPoints.length < 2) return [];
    const segments: { positions: [number, number][]; color: string }[] = [];
    for (let i = 0; i < trackPoints.length - 1; i++) {
      const p1 = trackPoints[i];
      const p2 = trackPoints[i + 1];
      const grad = computeGradient(p1, p2);
      segments.push({
        positions: [
          [p1.lat, p1.lon],
          [p2.lat, p2.lon],
        ],
        color: getGradientColor(grad),
      });
    }
    return segments;
  }, [trackPoints]);

  const sectionBoundaries = useMemo(() => {
    return sections.map((s) => ({
      distance: s.start_distance,
      name: s.name,
      type: s.section_type,
    }));
  }, [sections]);

  const center: [number, number] = useMemo(() => {
    if (trackPoints.length === 0) return [45.9, 6.8];
    const mid = Math.floor(trackPoints.length / 2);
    return [trackPoints[mid].lat, trackPoints[mid].lon];
  }, [trackPoints]);

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
      dragging={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds trackPoints={trackPoints} />
      {gradientPolylines.map((seg, i) => (
        <Polyline
          key={i}
          positions={seg.positions}
          pathOptions={{ color: seg.color, weight: 4, opacity: 0.8 }}
        />
      ))}
      {sectionBoundaries.map((b, i) => {
        const pt = findInterpolatedPoint(trackPoints, b.distance);
        if (!pt) return null;
        return (
          <Polyline
            key={`b-${i}`}
            positions={[
              [pt.lat - 0.001, pt.lon - 0.001],
              [pt.lat + 0.001, pt.lon + 0.001],
            ]}
            pathOptions={{
              color: SECTION_COLORS[b.type] ?? "#666",
              weight: 3,
              dashArray: "6,4",
            }}
          >
            <Popup>{b.name ?? b.type}</Popup>
          </Polyline>
        );
      })}
      {hoverDistance !== null && (
        <HoverMarker trackPoints={trackPoints} hoverDistance={hoverDistance} />
      )}
    </MapContainer>
  );
}
