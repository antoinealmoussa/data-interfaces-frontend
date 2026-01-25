import { useState } from "react";
import { Box, Button, Menu } from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import { type DropdownMenuProps } from "../../types/uiTypes";
import { MultiTypeMenuItem } from "./MultiTypeMenuItem";



export const DropdownMenu: React.FC<DropdownMenuProps> = (
    {
        label,
        icon: Icon,
        menuItems
    }) => {

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Box
            sx={{
                display: 'inline-block',
                height: "100%",
                justifyContent: 'right'
            }}
        >
            <Button
                onMouseEnter={handleOpen}
                startIcon={Icon ? <Icon /> : undefined}
                endIcon={<ArrowDropDown />}
                sx={{
                    height: "100%",
                    textTransform: 'none',
                    cursor: 'pointer',
                    px: 2,
                    alignContent: 'center'
                }}
            >
                {label}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    root: {
                        // Empêche le calque invisible de bloquer les événements de souris
                        sx: { pointerEvents: 'none' }
                    },
                    paper: {
                        // On réactive les clics uniquement sur le menu lui-même
                        sx: {
                            pointerEvents: 'auto',
                            marginTop: '-2px' // Élimine le vide entre bouton et menu
                        }
                    },
                    list: {
                        onMouseLeave: handleClose
                    }
                }}
                transitionDuration={0}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
            >
                {menuItems.map(menuItem => (
                    <MultiTypeMenuItem
                        item={menuItem.item}
                    />
                ))}
            </Menu>
        </Box>
    );
};
