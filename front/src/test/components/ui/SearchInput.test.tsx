import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchInput } from "../../../components/ui/SearchInput";

describe("SearchInput", () => {
    it("devrait afficher le TextField avec le placeholder", () => {
        render(
            <SearchInput
                value=""
                onChange={vi.fn()}
                onSearch={vi.fn()}
            />
        );
        expect(screen.getByPlaceholderText("Rechercher...")).toBeInTheDocument();
    });

    it("devrait afficher la valeur passée en prop", () => {
        render(
            <SearchInput
                value="mon texte"
                onChange={vi.fn()}
                onSearch={vi.fn()}
            />
        );
        const input = screen.getByRole("textbox");
        expect(input).toHaveValue("mon texte");
    });

    it("devrait appeler onChange quand l'utilisateur tape", () => {
        const onChange = vi.fn();
        render(
            <SearchInput
                value=""
                onChange={onChange}
                onSearch={vi.fn()}
            />
        );

        const input = screen.getByRole("textbox");
        fireEvent.change(input, { target: { value: "nouveau texte" } });

        expect(onChange).toHaveBeenCalledWith("nouveau texte");
    });

    it("devrait appeler onSearch quand Entrée est pressée", () => {
        const onSearch = vi.fn();
        render(
            <SearchInput
                value="test"
                onChange={vi.fn()}
                onSearch={onSearch}
            />
        );

        const input = screen.getByRole("textbox");
        fireEvent.keyDown(input, { key: "Enter" });

        expect(onSearch).toHaveBeenCalled();
    });

    it("ne devrait pas appeler onSearch si le champ est vide", () => {
        const onSearch = vi.fn();
        render(
            <SearchInput
                value=""
                onChange={vi.fn()}
                onSearch={onSearch}
            />
        );

        const input = screen.getByRole("textbox");
        fireEvent.keyDown(input, { key: "Enter" });

        expect(onSearch).not.toHaveBeenCalled();
    });

    it("ne devrait pas appeler onSearch si le champ ne contient que des espaces", () => {
        const onSearch = vi.fn();
        render(
            <SearchInput
                value="   "
                onChange={vi.fn()}
                onSearch={onSearch}
            />
        );

        const input = screen.getByRole("textbox");
        fireEvent.keyDown(input, { key: "Enter" });

        expect(onSearch).not.toHaveBeenCalled();
    });

    it("devrait être désactivé quand isLoading est true", () => {
        render(
            <SearchInput
                value="test"
                onChange={vi.fn()}
                onSearch={vi.fn()}
                isLoading={true}
            />
        );

        const input = screen.getByRole("textbox");
        expect(input).toBeDisabled();
    });

    it("ne devrait pas appeler onSearch quand désactivé", () => {
        const onSearch = vi.fn();
        render(
            <SearchInput
                value="test"
                onChange={vi.fn()}
                onSearch={onSearch}
                isLoading={true}
            />
        );

        const input = screen.getByRole("textbox");
        fireEvent.keyDown(input, { key: "Enter" });

        expect(onSearch).not.toHaveBeenCalled();
    });

    it("devrait utiliser le placeholder personnalisé", () => {
        render(
            <SearchInput
                value=""
                onChange={vi.fn()}
                onSearch={vi.fn()}
                placeholder="Cherchez ici..."
            />
        );
        expect(screen.getByPlaceholderText("Cherchez ici...")).toBeInTheDocument();
    });
});
