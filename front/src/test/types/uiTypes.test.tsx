import { describe, it, expect } from "vitest";
import React from "react";
import { mapUserApplicationToMenuItem } from "../../types/uiTypes";
import type { RouteProps } from "../../types/routesTypes";

describe("mapUserApplicationToMenuItem", () => {
    it("devrait mapper une application vers un MenuItemConfig de type link", () => {
        const apiData = {
            name: "bike-exploration",
            pretty_name: "Bike Exploration"
        };

        const config: RouteProps = {
            path: "/bike-exploration",
            element: <div>Content</div>
        };

        const result = mapUserApplicationToMenuItem(apiData, config);

        expect(result).toEqual({
            type: 'link',
            label: 'Bike Exploration',
            href: '/bike-exploration'
        });
    });

    it("devrait utiliser le nom de l'application comme label", () => {
        const apiData = {
            name: "rugby-teams",
            pretty_name: "Rugby Teams"
        };

        const config: RouteProps = {
            path: "/rugby-teams",
            element: <div>Content</div>
        };

        const result = mapUserApplicationToMenuItem(apiData, config);

        expect(result.type).toBe('link');
        expect(result.label).toBe('Rugby Teams');
        expect(result.href).toBe('/rugby-teams');
    });
});
