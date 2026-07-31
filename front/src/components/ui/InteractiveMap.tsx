import { type ReactNode, useCallback, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MarkerData {
  id: string | number;
  latitude: number;
  longitude: number;
  popup?: ReactNode;
}

interface InteractiveMapProps {
  markers: MarkerData[];
  height?: number | string;
  selectedMarkerId?: string | number | null;
}

const defaultIcon = L.divIcon({
  className: "",
  html: '<div style="background: #2D5A27; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

function MapBounds({ markers }: { markers: MarkerData[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    const points = markers.map((m) => [m.latitude, m.longitude] as [number, number]);
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(points, { padding: [50, 50] });
    }
  }, [map, markers]);
  return null;
}

export const InteractiveMap = ({ markers, height = 400, selectedMarkerId }: InteractiveMapProps) => {
  const defaultCenter: [number, number] = [46.6, 2.0];
  const markerRefs = useRef(new Map<string | number, L.Marker>());

  const setMarkerRef = useCallback((id: string | number, marker: L.Marker | null) => {
    if (marker) {
      markerRefs.current.set(id, marker);
    } else {
      markerRefs.current.delete(id);
    }
  }, []);

  useEffect(() => {
    if (selectedMarkerId == null) return;
    const marker = markerRefs.current.get(selectedMarkerId);
    if (marker) marker.openPopup();
  }, [selectedMarkerId]);

  return (
    <MapContainer
      center={defaultCenter}
      zoom={6}
      style={{ height, width: "100%", borderRadius: 8 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapBounds markers={markers} />
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.latitude, m.longitude]}
          icon={defaultIcon}
          ref={(ref) => setMarkerRef(m.id, ref)}
        >
          {m.popup && <Popup>{m.popup}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
};
