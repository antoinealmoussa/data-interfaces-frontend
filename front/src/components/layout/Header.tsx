import { Box, ButtonBase } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import { DropdownMenu } from "../ui/DropdownMenu";
import DirectionsBikeOutlinedIcon from '@mui/icons-material/DirectionsBikeOutlined';
import { type HeaderProps } from "../../types/layoutTypes";
import type { MultiTypeMenuItemProps } from "../../types/uiTypes";
import LogoutIcon from '@mui/icons-material/Logout';
import { MultiTypeMenuItem } from "../ui/MultiTypeMenuItem";


export const Header: React.FC<HeaderProps> = ({
    height
}) => {
    const { user, logout } = useAuth();

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
                href: '/'
            }
        },
        {
            item: {
                type: 'action',
                label: "Se déconnecter",
                onClick: logout,
                icon: LogoutIcon
            }
        }
    ]

    const applicationMenuItems: MultiTypeMenuItemProps[] = [
        {
            item: {
                type: 'link',
                label: 'Exploration vélo',
                href: '/'
            },
        },
        {
            item: {
                type: 'link',
                label: 'Rugby teams',
                href: '/'
            },
        },
        {
            item: {
                type: 'link',
                label: 'Préparation de course',
                href: '/'
            },
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
                {applicationMenuItems.map(applicationMenuItem => (
                    <MultiTypeMenuItem
                        item={applicationMenuItem.item}
                    />
                ))
                }
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
