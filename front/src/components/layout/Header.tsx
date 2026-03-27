import { Box, ButtonBase } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { DropdownMenu } from "../ui/DropdownMenu";
import DirectionsBikeOutlinedIcon from '@mui/icons-material/DirectionsBikeOutlined';
import { type HeaderProps } from "../../types/layoutTypes";
import type { MultiTypeMenuItemProps } from "../../types/uiTypes";
import LogoutIcon from '@mui/icons-material/Logout';
import { HorizontalUserAppMenu } from "../ui/HorizontalUserAppMenu";
import { PRIVATE_STANDARD_ROUTES } from "../../routes";
import { useLogout } from "../../hooks/useLogout";

export const Header: React.FC<HeaderProps> = ({
    height
}) => {
    const { user } = useAuth();

    const rightMenuItems: MultiTypeMenuItemProps[] = [
        {
            item: {
                type: 'label',
                label: `${user?.first_name} ${user?.surname}`
            },

        },
        {
            item: {
                type: 'link',
                label: "Voir mon profil",
                href: PRIVATE_STANDARD_ROUTES.PROFILE.path
            }
        },
        {
            item: {
                type: 'action',
                label: "Se déconnecter",
                onClick: useLogout(),
                icon: LogoutIcon
            }
        }
    ]

    return (
        <Box
            sx={{
                bgcolor: "background.paper",
                px: 1,
                boxShadow: 1,
                height,
                zIndex: 10,
                position: "sticky",
                display: "flex",
                flexDirection: "row"
            }}
        >
            <ButtonBase
                component={Link}
                to="/"
                sx={{
                    flex: 1,
                    overflow: "hidden",
                    '&:hover': {
                        '&:img': {
                            transform: 'scale(1.05)'
                        }
                    }
                }}>
                <Box
                    component="img"
                    src="/StravoskaLogoFinal.png"
                    sx={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: 'contain'
                    }} />
            </ButtonBase>
            <Box
                sx={{
                    flex: 5,
                    height,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: 'center',
                    gap: 3
                }}
            >
                <HorizontalUserAppMenu />
            </Box>
            <Box
                sx={{
                    flex: 0.5,
                    height
                }}>
                <DropdownMenu
                    icon={DirectionsBikeOutlinedIcon}
                    label=""
                    menuItems={rightMenuItems}
                />
            </Box>
        </Box>
    );
};
