import type { RouteProps } from "./routesTypes";

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

export interface ApiUserApplication {
  name: string;
  pretty_name: string;
}

export const mapUserApplicationToMenuItem = (apiData: ApiUserApplication, config: RouteProps): MenuItemConfig => ({
  type: 'link',
  label: apiData.pretty_name,
  href: config.path
})