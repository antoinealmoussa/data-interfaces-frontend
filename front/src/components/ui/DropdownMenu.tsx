import { useState } from "react";
import { Button, Menu, MenuItem } from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";
import { randomWord } from "../../utils/randomData";

interface DropdownMenuProps {
    title: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ title }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Button
                onClick={handleClick}
                endIcon={<ArrowDropDown />}
                sx={{ color: "gray", mx: 1 }}
            >
                {title}
            </Button>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {Array.from({ length: 3 }).map((_, i) => (
                    <MenuItem key={i} onClick={handleClose}>
                        {randomWord()}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};
