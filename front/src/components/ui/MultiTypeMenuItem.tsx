import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { type MultiTypeMenuItemProps } from "../../types/uiTypes";
import { Link as RouterLink } from 'react-router-dom';



export const MultiTypeMenuItem: React.FC<MultiTypeMenuItemProps> = (
    {
        item
    }) => {
    const { label, icon: Icon, type } = item;

    switch (type) {
        case 'label':
            return (
                <MenuItem
                    disabled
                >
                    <ListItemText primary={label} />
                </MenuItem>
            )

        case 'link':
            return (
                <MenuItem
                    component={RouterLink}
                    to={item.href}
                >
                    <ListItemText primary={label} />
                </MenuItem>
            )

        case 'action':
            return (
                <MenuItem
                    onClick={item.onClick}
                >
                    <ListItemText
                        primary={label}
                    />
                    {Icon && <ListItemIcon
                        sx={{
                            justifyContent: "right"
                        }}
                    >
                        <Icon />
                    </ListItemIcon>}
                </MenuItem>
            )
        default:
            return null
    }
};
