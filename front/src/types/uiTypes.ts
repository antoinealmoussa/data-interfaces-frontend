import type { RouteProps } from "./routesTypes";
import type { Application } from "./authTypes";
import type { JSX } from "react";

export interface DropdownMenuProps {
  label?: string;
  icon?: React.ElementType;
  menuItems: MultiTypeMenuItemProps[];
}

interface BaseMenuItem {
  label: string;
  icon?: React.ElementType;
}

interface LabelMenuItem extends BaseMenuItem {
  type: "label";
}

interface LinkMenuItem extends BaseMenuItem {
  type: "link";
  href: string;
}

interface ActionMenuItem extends BaseMenuItem {
  type: "action";
  onClick: () => void;
}

export type MenuItemConfig = LabelMenuItem | LinkMenuItem | ActionMenuItem;

export interface MultiTypeMenuItemProps {
  item: MenuItemConfig;
}

export const mapUserApplicationToMenuItem = (apiData: Application, config: RouteProps): MenuItemConfig => ({
  type: 'link',
  label: apiData.pretty_name,
  href: config.path
})

export interface LoadingSpinnerProps {
  size?: number;
  text?: string;
}

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export type HomeState = "idle" | "loading" | "success" | "error";

export interface SidebarItem {
  label: string;
  path: string;
  icon: JSX.Element;
}

export interface GenericSidebarProps {
  items: SidebarItem[];
  teams: Array<{ id: number; name: string }>;
  seasons: Array<{ id: number; name: string }>;
  selectedTeamName: string | null;
  selectedSeasonName: string | null;
  onTeamChange: (teamName: string) => void;
  onSeasonChange: (seasonName: string) => void;
}

export interface SnackbarState {
  open: boolean;
  severity: "success" | "error";
  message: string;
}