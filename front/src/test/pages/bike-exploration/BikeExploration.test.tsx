import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BikeExploration from "../../../pages/bike-exploration/BikeExploration";

const mockedUseConqueredCols = vi.hoisted(() => vi.fn());
const mockedUseUploadActivities = vi.hoisted(() => vi.fn());
const mockedBikeApi = vi.hoisted(() => ({
  resetActivities: vi.fn(),
}));
const mockedGpxUploadCard = vi.hoisted(() => vi.fn());
const mockedInteractiveMap = vi.hoisted(() => vi.fn());

vi.mock("../../../hooks/bike-exploration/useBikeExploration", () => ({
  useConqueredCols: (...args: unknown[]) => mockedUseConqueredCols(...args),
  useUploadActivities: (...args: unknown[]) =>
    mockedUseUploadActivities(...args),
}));

vi.mock("../../../api/bike-exploration/bikeApi", () => ({
  bikeApi: mockedBikeApi,
}));

vi.mock("../../../components/bike-exploration/GpxUploadCard", () => ({
  GpxUploadCard: (props: { onUpload: (file: File) => void }) => {
    mockedGpxUploadCard(props);
    return (
      <button onClick={() => props.onUpload(new File([], "activite.gpx"))}>
        Importer
      </button>
    );
  },
}));

vi.mock("../../../components/ui/InteractiveMap", () => ({
  InteractiveMap: (props: { selectedMarkerId: number | null }) => {
    mockedInteractiveMap(props);
    return <div data-testid="interactive-map">{String(props.selectedMarkerId)}</div>;
  },
}));

const colsFixture = [
  {
    id: 1,
    name: "Col du Galibier",
    latitude: 45.0642,
    longitude: 6.4092,
    activity_count: 3,
    total_crossings: 5,
    elevation: 2642,
    country: "France",
  },
];

const renderPage = () => {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BikeExploration />
    </QueryClientProvider>,
  );
};

describe("BikeExploration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseConqueredCols.mockReturnValue({
      data: [],
      isLoading: false,
    });
    mockedUseUploadActivities.mockReturnValue({
      mutate: vi.fn(),
      cancel: vi.fn(),
      phase: "idle",
      progress: 0,
      result: null,
      error: null,
      isPending: false,
    });
    mockedBikeApi.resetActivities.mockResolvedValue(undefined);
  });

  it("devrait afficher le chargement quand les cols sont chargés", () => {
    mockedUseConqueredCols.mockReturnValue({ data: [], isLoading: true });
    renderPage();

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("devrait afficher la carte d'upload quand il n'y a pas de données", () => {
    renderPage();

    expect(screen.getByText("Importer")).toBeInTheDocument();
    expect(screen.getByText("Exploration vélo")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Réinitialiser" }),
    ).not.toBeInTheDocument();
  });

  it("devrait afficher le tableau des cols gravis", () => {
    mockedUseConqueredCols.mockReturnValue({ data: colsFixture, isLoading: false });
    renderPage();

    expect(screen.getByText("Cols gravis (1)")).toBeInTheDocument();
    expect(screen.getByText("Col du Galibier")).toBeInTheDocument();
    expect(screen.getByText("2642 m")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Réinitialiser" }),
    ).toBeInTheDocument();
  });

  it("devrait sélectionner un col au clic sur une ligne", async () => {
    const user = userEvent.setup();
    mockedUseConqueredCols.mockReturnValue({ data: colsFixture, isLoading: false });
    renderPage();

    await user.click(screen.getByText("Col du Galibier"));

    expect(screen.getByTestId("interactive-map")).toHaveTextContent("1");
    expect(mockedInteractiveMap).toHaveBeenCalledWith(
      expect.objectContaining({ selectedMarkerId: 1 }),
    );
  });

  it("devrait réinitialiser les activités après confirmation", async () => {
    const user = userEvent.setup();
    mockedUseConqueredCols.mockReturnValue({ data: colsFixture, isLoading: false });
    renderPage();

    await user.click(screen.getByRole("button", { name: "Réinitialiser" }));

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByText("Réinitialiser les données"),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Réinitialiser" }));

    await waitFor(() => {
      expect(mockedBikeApi.resetActivities).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("ne devrait pas réinitialiser si l'annulation est choisie", async () => {
    const user = userEvent.setup();
    mockedUseConqueredCols.mockReturnValue({ data: colsFixture, isLoading: false });
    renderPage();

    await user.click(screen.getByRole("button", { name: "Réinitialiser" }));

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Annuler" }));

    expect(mockedBikeApi.resetActivities).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
