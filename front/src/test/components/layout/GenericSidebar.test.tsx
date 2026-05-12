import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { GenericSidebar } from "../../../components/layout/GenericSidebar";
import { Box } from "@mui/material";

const mockItems = [
    { label: "Gestion", path: "management", icon: <Box data-testid="icon-management" /> },
    { label: "Tournoi", path: "tournament", icon: <Box data-testid="icon-tournament" /> },
];

const mockTeams = [
    { id: 1, name: "Équipe A" },
    { id: 2, name: "Équipe B" },
];

const mockSeasons = [
    { id: 10, name: "2024-2025" },
    { id: 11, name: "2025-2026" },
];

const onTeamChange = vi.fn();
const onSeasonChange = vi.fn();

const renderSidebar = (props: Partial<Parameters<typeof GenericSidebar>[0]> = {}) => {
    return render(
        <MemoryRouter initialEntries={["/rugby-teams"]}>
            <GenericSidebar
                items={props.items ?? mockItems}
                teams={props.teams ?? mockTeams}
                seasons={props.seasons ?? mockSeasons}
                selectedTeamId={props.selectedTeamId ?? 1}
                selectedSeasonId={props.selectedSeasonId ?? 10}
                onTeamChange={props.onTeamChange ?? onTeamChange}
                onSeasonChange={props.onSeasonChange ?? onSeasonChange}
            />
        </MemoryRouter>
    );
};

describe("GenericSidebar", () => {
    it("devrait rendre la sidebar", () => {
        const { container } = renderSidebar();
        expect(container.querySelector("div")).toBeInTheDocument();
    });

    it("devrait afficher les éléments de navigation", () => {
        renderSidebar();
        expect(screen.getByText("Gestion")).toBeInTheDocument();
        expect(screen.getByText("Tournoi")).toBeInTheDocument();
    });

    it("devrait afficher les icônes des éléments", () => {
        renderSidebar();
        expect(screen.getByTestId("icon-management")).toBeInTheDocument();
        expect(screen.getByTestId("icon-tournament")).toBeInTheDocument();
    });

    it("devrait contenir un sélecteur d'équipe", () => {
        const { container } = renderSidebar();
        const labels = container.querySelectorAll("label");
        const equipeLabel = Array.from(labels).find(l => l.textContent === "Équipe");
        expect(equipeLabel).toBeInTheDocument();
    });

    it("devrait contenir un sélecteur de saison", () => {
        const { container } = renderSidebar();
        const labels = container.querySelectorAll("label");
        const saisonLabel = Array.from(labels).find(l => l.textContent === "Saison");
        expect(saisonLabel).toBeInTheDocument();
    });

    it("devrait sélectionner une équipe par défaut", () => {
        const { container } = renderSidebar();
        const selectInputs = container.querySelectorAll("input");
        const teamInput = selectInputs[0];
        expect(teamInput).toBeInTheDocument();
        expect(teamInput?.getAttribute("value")).toBe("1");
    });
});
