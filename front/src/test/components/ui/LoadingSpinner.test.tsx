import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";

describe("LoadingSpinner", () => {
    it("devrait rendre le CircularProgress", () => {
        render(<LoadingSpinner />);
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("devrait accepter une taille personnalisée", () => {
        const { rerender } = render(<LoadingSpinner size={60} />);
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
        
        rerender(<LoadingSpinner size={100} />);
        expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
});
