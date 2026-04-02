import type { RouteProps } from "./routesTypes";
import type { Application } from "./authTypes"

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