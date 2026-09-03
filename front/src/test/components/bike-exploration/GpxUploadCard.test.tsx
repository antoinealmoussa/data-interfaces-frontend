import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GpxUploadCard } from "../../../components/bike-exploration/GpxUploadCard";

const makeFile = (name: string, size = 1024) =>
  new File([new ArrayBuffer(size)], name, { type: "application/zip" });

describe("GpxUploadCard", () => {
  const defaultProps = () => ({
    onUpload: vi.fn(),
    onCancel: vi.fn(),
    isUploading: false,
    phase: "idle" as const,
    result: null,
    progress: null,
    error: null,
  });

  it("devrait afficher les instructions et un bouton désactivé sans fichier", () => {
    render(<GpxUploadCard {...defaultProps()} />);

    expect(screen.getByText("Importer des activités :")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /importer 0 fichier/i });
    expect(button).toBeDisabled();
  });

  it("devrait lister les fichiers sélectionnés et activer le bouton", () => {
    const props = defaultProps();
    const { container } = render(<GpxUploadCard {...props} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("a.zip")] } });

    expect(screen.getByText("a.zip")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: /importer 1 fichier/i });
    expect(button).toBeEnabled();
  });

  it("devrait appeler onUpload pour chaque fichier puis vider la liste", () => {
    const props = defaultProps();
    const { container } = render(<GpxUploadCard {...props} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [makeFile("a.zip"), makeFile("b.zip")] },
    });
    fireEvent.click(screen.getByRole("button", { name: /importer 2 fichier/i }));

    expect(props.onUpload).toHaveBeenCalledTimes(2);
    expect(props.onUpload).toHaveBeenCalledWith(expect.any(File));
    expect(screen.queryByText("a.zip")).not.toBeInTheDocument();
  });

  it("devrait ignorer les fichiers non-zip lors du drop", () => {
    const props = defaultProps();
    render(<GpxUploadCard {...props} />);

    const dropzone = screen.getByText("Déposez vos fichiers ici");
    fireEvent.drop(dropzone, {
      dataTransfer: {
        files: [makeFile("valid.zip"), makeFile("notes.txt")],
      },
    });

    expect(screen.getByText("valid.zip")).toBeInTheDocument();
    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument();
  });

  it("devrait afficher le message d'erreur", () => {
    const props = { ...defaultProps(), error: "Fichier trop lourd" };
    render(<GpxUploadCard {...props} />);

    expect(screen.getByText("Fichier trop lourd")).toBeInTheDocument();
  });

  it("devrait afficher le résultat avec le nombre d'imports", () => {
    const props = {
      ...defaultProps(),
      result: { created: 3, skipped: 1 },
    };
    render(<GpxUploadCard {...props} />);

    expect(
      screen.getByText("3 importée(s), 1 ignorée(s)"),
    ).toBeInTheDocument();
  });

  it("devrait afficher la phase d'envoi", () => {
    const props = { ...defaultProps(), phase: "uploading" as const };
    render(<GpxUploadCard {...props} />);

    expect(screen.getByText("Envoi du fichier en cours...")).toBeInTheDocument();
  });

  it("devrait afficher la progression pendant le traitement", () => {
    const props = {
      ...defaultProps(),
      phase: "processing" as const,
      progress: { current: 2, total: 4, name: "activite.fit" },
    };
    render(<GpxUploadCard {...props} />);

    expect(
      screen.getByText("activite.fit (2/4)"),
    ).toBeInTheDocument();
  });

  it("devrait afficher la progression sans nom de fichier", () => {
    const props = {
      ...defaultProps(),
      phase: "processing" as const,
      progress: { current: 1, total: 2, name: "" },
    };
    render(<GpxUploadCard {...props} />);

    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  it("devrait afficher la phase d'annulation et désactiver le bouton", () => {
    const props = { ...defaultProps(), phase: "cancelling" as const };
    render(<GpxUploadCard {...props} />);

    expect(screen.getByText("Annulation en cours...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /importer/i })).toBeDisabled();
  });

  it("devrait appeler onCancel depuis le bouton d'annulation", () => {
    const props = { ...defaultProps(), phase: "processing" as const };
    render(<GpxUploadCard {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }));

    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it("devrait afficher 'Import en cours...' pendant l'upload", () => {
    const props = { ...defaultProps(), isUploading: true };
    render(<GpxUploadCard {...props} />);

    expect(screen.getByText("Import en cours...")).toBeInTheDocument();
  });
});
