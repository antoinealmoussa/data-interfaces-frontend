import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileDropzone } from "../../../components/common/FileDropzone";

const makeFile = (name: string, size = 1024) =>
  new File([new ArrayBuffer(size)], name);

describe("FileDropzone", () => {
  const defaultProps = () => ({
    accept: ".gpx",
    onFilesSelected: vi.fn(),
  });

  it("devrait afficher les textes par défaut", () => {
    render(<FileDropzone {...defaultProps()} />);

    expect(screen.getByText("Déposez vos fichiers ici")).toBeInTheDocument();
    expect(
      screen.getByText("ou cliquez pour sélectionner"),
    ).toBeInTheDocument();
  });

  it("devrait afficher les textes personnalisés", () => {
    render(
      <FileDropzone
        {...defaultProps()}
        title="Titre custom"
        subtitle="Sous-titre custom"
      />,
    );

    expect(screen.getByText("Titre custom")).toBeInTheDocument();
    expect(screen.getByText("Sous-titre custom")).toBeInTheDocument();
  });

  it("devrait ouvrir le sélecteur de fichiers au clic", () => {
    const clickSpy = vi
      .spyOn(HTMLInputElement.prototype, "click")
      .mockImplementation(() => {});
    render(<FileDropzone {...defaultProps()} />);

    fireEvent.click(screen.getByText("Déposez vos fichiers ici"));

    expect(clickSpy).toHaveBeenCalledTimes(1);
    clickSpy.mockRestore();
  });

  it("devrait appeler onFilesSelected avec le fichier sélectionné", () => {
    const props = defaultProps();
    const { container } = render(<FileDropzone {...props} />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("trace.gpx")] } });

    expect(props.onFilesSelected).toHaveBeenCalledTimes(1);
    expect(props.onFilesSelected).toHaveBeenCalledWith([expect.any(File)]);
  });

  it("devrait réinitialiser la valeur de l'input après sélection", () => {
    const props = defaultProps();
    const { container } = render(<FileDropzone {...props} />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("trace.gpx")] } });

    expect(input.value).toBe("");
  });

  it("devrait filtrer les fichiers non conformes et afficher une alerte", () => {
    const props = defaultProps();
    const { container } = render(<FileDropzone {...props} />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [makeFile("trace.gpx"), makeFile("notes.txt")] },
    });

    expect(props.onFilesSelected).toHaveBeenCalledWith([expect.any(File)]);
    expect(
      screen.getByText(/Format non supporté \(attendu : \.gpx\) : notes\.txt/),
    ).toBeInTheDocument();
  });

  it("ne devrait rien appeler si aucun fichier n'est conforme", () => {
    const props = defaultProps();
    const { container } = render(<FileDropzone {...props} />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeFile("notes.txt")] } });

    expect(props.onFilesSelected).not.toHaveBeenCalled();
  });

  it("ne devrait passer qu'un seul fichier en mode simple", () => {
    const props = defaultProps();
    const { container } = render(<FileDropzone {...props} />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [makeFile("a.gpx"), makeFile("b.gpx")] },
    });

    expect(props.onFilesSelected).toHaveBeenCalledTimes(1);
    expect(props.onFilesSelected.mock.calls[0][0]).toHaveLength(1);
  });

  it("devrait passer tous les fichiers en mode multiple", () => {
    const props = { ...defaultProps(), multiple: true };
    const { container } = render(<FileDropzone {...props} />);

    const input = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [makeFile("a.zip"), makeFile("b.zip")] },
    });

    expect(props.onFilesSelected.mock.calls[0][0]).toHaveLength(2);
  });

  it("devrait accepter les fichiers déposés", () => {
    const props = defaultProps();
    render(<FileDropzone {...props} />);

    const dropzone = screen.getByText("Déposez vos fichiers ici");
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [makeFile("trace.gpx")] },
    });

    expect(props.onFilesSelected).toHaveBeenCalledWith([expect.any(File)]);
  });

  it("devrait filtrer les fichiers déposés non conformes", () => {
    const props = defaultProps();
    render(<FileDropzone {...props} />);

    const dropzone = screen.getByText("Déposez vos fichiers ici");
    fireEvent.drop(dropzone, {
      dataTransfer: { files: [makeFile("valid.gpx"), makeFile("notes.txt")] },
    });

    expect(props.onFilesSelected).toHaveBeenCalledWith([expect.any(File)]);
    expect(screen.queryByText("notes.txt")).not.toBeInTheDocument();
  });

  it("devrait afficher l'état pending", () => {
    render(<FileDropzone {...defaultProps()} isPending />);

    expect(screen.getByText("Import en cours...")).toBeInTheDocument();
  });

  it("devrait afficher l'erreur dans une alerte", () => {
    render(<FileDropzone {...defaultProps()} error="Erreur lors de l'import" />);

    expect(screen.getByText("Erreur lors de l'import")).toBeInTheDocument();
  });
});
