import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RaceUpload } from "../../../components/race-preparation/RaceUpload";

const makeFile = (name: string, size = 1024) =>
  new File([new ArrayBuffer(size)], name);

describe("RaceUpload", () => {
  const defaultProps = () => ({
    onUpload: vi.fn(),
    isUploading: false,
    error: null,
  });

  it("devrait afficher les instructions d'upload", () => {
    render(<RaceUpload {...defaultProps()} />);

    expect(screen.getByText("Déposez un fichier GPX ici")).toBeInTheDocument();
    expect(
      screen.getByText("ou cliquez pour sélectionner un fichier"),
    ).toBeInTheDocument();
  });

  it("devrait appeler onUpload avec un fichier .gpx", () => {
    const props = defaultProps();
    const { container } = render(<RaceUpload {...props} />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("race.gpx")] } });

    expect(props.onUpload).toHaveBeenCalledTimes(1);
    expect(props.onUpload).toHaveBeenCalledWith(expect.any(File));
  });

  it("ne devrait pas appeler onUpload avec un fichier non-gpx", () => {
    const props = defaultProps();
    const { container } = render(<RaceUpload {...props} />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("race.txt")] } });

    expect(props.onUpload).not.toHaveBeenCalled();
    expect(screen.getByText(/Format non supporté/)).toBeInTheDocument();
  });

  it("devrait afficher l'état d'upload en cours", () => {
    render(<RaceUpload {...defaultProps()} isUploading />);

    expect(screen.getByText("Import en cours...")).toBeInTheDocument();
  });

  it("devrait afficher l'erreur d'import", () => {
    render(<RaceUpload {...defaultProps()} error="Erreur lors de l'import" />);

    expect(screen.getByText("Erreur lors de l'import")).toBeInTheDocument();
  });
});
