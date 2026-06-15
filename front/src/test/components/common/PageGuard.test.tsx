import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageGuard } from "../../../components/common/PageGuard";

describe("PageGuard", () => {
  it("devrait afficher un spinner pendant le chargement", () => {
    render(
      <PageGuard loading={true} error={null}>
        <div>Contenu</div>
      </PageGuard>,
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByText("Contenu")).not.toBeInTheDocument();
  });

  it("devrait afficher une erreur quand error est fourni", () => {
    render(
      <PageGuard loading={false} error="Erreur de chargement">
        <div>Contenu</div>
      </PageGuard>,
    );

    expect(screen.getByText("Erreur de chargement")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("Contenu")).not.toBeInTheDocument();
  });

  it("devrait afficher les enfants quand loading est false et error est null", () => {
    render(
      <PageGuard loading={false} error={null}>
        <div>Contenu affiché</div>
      </PageGuard>,
    );

    expect(screen.getByText("Contenu affiché")).toBeInTheDocument();
  });

  it("devrait prioriser le loading sur l'erreur", () => {
    render(
      <PageGuard loading={true} error="Erreur ignorée">
        <div>Contenu</div>
      </PageGuard>,
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByText("Erreur ignorée")).not.toBeInTheDocument();
  });
});
