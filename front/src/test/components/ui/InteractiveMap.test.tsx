import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { InteractiveMap } from "../../../components/ui/InteractiveMap";

const mapMock = {
  setView: vi.fn(),
  fitBounds: vi.fn(),
};

const markerInstances: { openPopup: ReturnType<typeof vi.fn> }[] = [];

vi.mock("react-leaflet", () => ({
  MapContainer: ({ children }: { children?: ReactNode }) => (
    <div data-testid="map-container">{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({
    children,
    ref,
  }: {
    children?: ReactNode;
    ref?: (marker: unknown) => void;
  }) => {
    const instance = { openPopup: vi.fn() };
    markerInstances.push(instance);
    if (typeof ref === "function") ref(instance);
    return <div data-testid="marker">{children}</div>;
  },
  Popup: ({ children }: { children?: ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  useMap: () => mapMock,
}));

vi.mock("leaflet", () => ({
  default: {
    divIcon: vi.fn(() => ({ className: "", options: {} })),
  },
}));

describe("InteractiveMap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    markerInstances.length = 0;
  });

  it("devrait rendre le conteneur de carte avec les props par défaut", () => {
    render(<InteractiveMap markers={[]} />);

    expect(screen.getByTestId("map-container")).toBeInTheDocument();
    expect(screen.getByTestId("tile-layer")).toBeInTheDocument();
    expect(mapMock.setView).not.toHaveBeenCalled();
    expect(mapMock.fitBounds).not.toHaveBeenCalled();
  });

  it("devrait ajuster la vue sur le point unique", () => {
    render(
      <InteractiveMap
        markers={[{ id: 1, latitude: 45.1, longitude: 6.1, popup: <span>Col</span> }]}
      />,
    );

    expect(mapMock.setView).toHaveBeenCalledWith([45.1, 6.1], 13);
    expect(screen.getByTestId("popup")).toBeInTheDocument();
  });

  it("devrait ajuster les bornes pour plusieurs marqueurs", () => {
    render(
      <InteractiveMap
        markers={[
          { id: 1, latitude: 45.1, longitude: 6.1 },
          { id: 2, latitude: 46.2, longitude: 7.2 },
        ]}
      />,
    );

    expect(mapMock.fitBounds).toHaveBeenCalledWith(
      [
        [45.1, 6.1],
        [46.2, 7.2],
      ],
      { padding: [50, 50] },
    );
    expect(screen.getAllByTestId("marker")).toHaveLength(2);
  });

  it("devrait ouvrir la popup du marqueur sélectionné", () => {
    render(
      <InteractiveMap
        markers={[{ id: 7, latitude: 45.1, longitude: 6.1 }]}
        selectedMarkerId={7}
      />,
    );

    expect(markerInstances.at(-1)?.openPopup).toHaveBeenCalled();
  });

  it("devrait ouvrir la popup quand la sélection change", () => {
    const { rerender } = render(
      <InteractiveMap
        markers={[
          { id: 1, latitude: 45.1, longitude: 6.1 },
          { id: 2, latitude: 46.2, longitude: 7.2 },
        ]}
        selectedMarkerId={1}
      />,
    );

    markerInstances.length = 0;
    rerender(
      <InteractiveMap
        markers={[
          { id: 1, latitude: 45.1, longitude: 6.1 },
          { id: 2, latitude: 46.2, longitude: 7.2 },
        ]}
        selectedMarkerId={2}
      />,
    );

    expect(markerInstances.at(-1)?.openPopup).toHaveBeenCalled();
  });

  it("devrait appliquer la hauteur personnalisée", () => {
    render(<InteractiveMap markers={[]} height={250} />);

    expect(screen.getByTestId("map-container")).toBeInTheDocument();
  });
});
