import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleGuard } from "../../../components/common/RoleGuard";
import { AuthContext } from "../../../contexts/AuthContextDefinition";
import type { User } from "../../../types/authTypes";

const adminUser: User = {
  id: 1,
  email: "admin@test.com",
  first_name: "Admin",
  surname: "User",
  role: "admin",
};

const normalUser: User = {
  id: 1,
  email: "test@test.com",
  first_name: "Test",
  surname: "User",
  role: "normal_user",
};

const renderWithAuth = (user: User | null, children: React.ReactNode) => {
  const authContext = {
    isAuthenticated: user !== null,
    isLoading: false,
    user,
    applications: [],
    login: vi.fn(),
    logout: vi.fn(),
    hasRole: (...roles: string[]) =>
      user !== null && roles.includes(user.role),
    isAdmin: user?.role === "admin",
  };

  return render(
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>,
  );
};

describe("RoleGuard", () => {
  it("devrait rendre les children si le rôle est autorisé", () => {
    renderWithAuth(
      adminUser,
      <RoleGuard roles={["admin"]}>
        <div>Panneau admin</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Panneau admin")).toBeInTheDocument();
  });

  it("devrait afficher le fallback si le rôle n'est pas autorisé", () => {
    renderWithAuth(
      normalUser,
      <RoleGuard roles={["admin"]} fallback={<div>Accès refusé</div>}>
        <div>Panneau admin</div>
      </RoleGuard>,
    );

    expect(screen.queryByText("Panneau admin")).not.toBeInTheDocument();
    expect(screen.getByText("Accès refusé")).toBeInTheDocument();
  });

  it("devrait retourner null sans fallback si le rôle n'est pas autorisé", () => {
    renderWithAuth(
      normalUser,
      <RoleGuard roles={["admin"]}>
        <div>Panneau admin</div>
      </RoleGuard>,
    );

    expect(screen.queryByText("Panneau admin")).not.toBeInTheDocument();
  });

  it("devrait accepter plusieurs rôles", () => {
    renderWithAuth(
      normalUser,
      <RoleGuard roles={["admin", "normal_user"]}>
        <div>Contenu visible</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Contenu visible")).toBeInTheDocument();
  });
});
