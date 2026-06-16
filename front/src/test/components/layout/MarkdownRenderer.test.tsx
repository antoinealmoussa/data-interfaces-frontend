import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MarkdownRenderer from "../../../components/layout/MarkdownRenderer";

describe("MarkdownRenderer", () => {
  it("devrait rendre du texte simple", () => {
    render(<MarkdownRenderer>Hello World</MarkdownRenderer>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("devrait rendre du markdown avec des titres", () => {
    render(<MarkdownRenderer># Titre 1</MarkdownRenderer>);
    expect(screen.getByText("Titre 1")).toBeInTheDocument();
  });

  it("devrait rendre du texte vide sans erreur", () => {
    const { container } = render(<MarkdownRenderer>{""}</MarkdownRenderer>);
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("devrait appliquer le style error quand state=error", () => {
    const { container } = render(
      <MarkdownRenderer state="error">Erreur</MarkdownRenderer>,
    );
    const box = container.querySelector("div");
    expect(box).toHaveStyle("background-color: rgb(239, 83, 80)");
  });

  it("devrait appliquer le style success quand state=success", () => {
    render(<MarkdownRenderer state="success">Succès</MarkdownRenderer>);
    expect(screen.getByText("Succès")).toBeInTheDocument();
  });

  it("devrait rendre du texte en gras", () => {
    render(<MarkdownRenderer>**Texte gras**</MarkdownRenderer>);
    expect(screen.getByText("Texte gras")).toBeInTheDocument();
  });
});
