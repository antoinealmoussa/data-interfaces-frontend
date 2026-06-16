import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GenericDataTable } from "../../../components/common/GenericDataTable";

interface TestRow {
  id: number;
  name: string;
  age: number;
}

const columns = [
  { key: "name" as const, label: "Nom" },
  { key: "age" as const, label: "Âge" },
];

const rows: TestRow[] = [
  { id: 1, name: "Alice", age: 30 },
  { id: 2, name: "Bob", age: 25 },
  { id: 3, name: "Charlie", age: 35 },
];

const renderTable = (props: Record<string, unknown> = {}) =>
  render(
    <GenericDataTable<TestRow>
      columns={columns}
      rows={rows}
      getRowId={(row) => row.id}
      {...props}
    />,
  );

describe("GenericDataTable", () => {
  it("devrait afficher les en-têtes de colonnes", () => {
    renderTable();
    expect(screen.getByText("Nom")).toBeInTheDocument();
    expect(screen.getByText("Âge")).toBeInTheDocument();
  });

  it("devrait afficher les lignes de données", () => {
    renderTable();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("devrait afficher un spinner pendant le chargement", () => {
    renderTable({ loading: true });
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });

  it("devrait afficher une alerte en cas d'erreur", () => {
    renderTable({ error: "Erreur de chargement" });
    expect(screen.getByText("Erreur de chargement")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("devrait afficher le message vide quand il n'y a pas de données", () => {
    renderTable({ rows: [], emptyMessage: "Aucun résultat" });
    expect(screen.getByText("Aucun résultat")).toBeInTheDocument();
  });

  it("devrait afficher le message vide par défaut", () => {
    renderTable({ rows: [] });
    expect(screen.getByText("Aucune donnée")).toBeInTheDocument();
  });

  it("devrait filtrer les lignes avec la recherche", () => {
    renderTable({ search: "Bob" });
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("Charlie")).not.toBeInTheDocument();
  });

  it("devrait trier les lignes au clic sur un en-tête", () => {
    renderTable();

    const ageHeader = screen.getByText("Âge");
    fireEvent.click(ageHeader);

    const cells = screen.getAllByRole("cell");
    const ageCellIndex = cells.findIndex((c) => c.textContent === "25");
    expect(ageCellIndex).not.toBe(-1);
  });

  it("devrait afficher la colonne des actions", () => {
    const actions = [
      { label: "Modifier", icon: <span>✏️</span>, onClick: vi.fn() },
    ];

    renderTable({ actions });
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("devrait gérer le mode tri contrôlé", () => {
    const onSortChange = vi.fn();
    renderTable({
      orderBy: "name",
      order: "asc",
      onSortChange,
    });

    const nameHeader = screen.getByText("Nom");
    fireEvent.click(nameHeader);

    expect(onSortChange).toHaveBeenCalledWith("name", "desc");
  });

  it("devrait masquer la recherche interne en mode contrôlé", () => {
    const onSearchChange = vi.fn();
    renderTable({
      search: "",
      onSearchChange,
    });

    expect(screen.queryByPlaceholderText("Rechercher...")).not.toBeInTheDocument();
  });

  it("devrait paginer les résultats", () => {
    const manyRows = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `Personne ${i + 1}`,
      age: 20 + i,
    }));

    renderTable({ rows: manyRows });

    expect(screen.getByText("1-10 sur 25")).toBeInTheDocument();
    expect(screen.getByText("Personne 1")).toBeInTheDocument();
    expect(screen.queryByText("Personne 11")).not.toBeInTheDocument();
  });
});
