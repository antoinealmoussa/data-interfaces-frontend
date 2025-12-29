import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material'

const wvaImages = {
    'col-1': [
        'wva-ventoux.jpg',
        'wva-montmartre.jpg',
        'wva-sanremo.jpg',
    ],
    'col-2': [
        'wva-roubaix.jpg',
        'wva-stradebianche.jpg',
        'wva-sienne.jpg',
    ],
    'col-3': [
        'wva-paris.jpg',
        'wva-neige.webp',
        'wva-calais.jpg'
    ]
};

export const PublicLayout = () => {
    return (
        <Box sx={{
            display: "flex",
            flexDirection: "row",
            height: "100vh",
            width: "100vw",
            overflow: "hidden"
        }}>
            {Object.values(wvaImages).map((col, colIndex) => (
                <Box
                    key={`col-${colIndex}`}
                    sx={{
                        height: "100%",
                        flex: 2,
                        ml: 0.5,
                        display: "flex",
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 0.5
                    }}>
                    {col.map((item) => (
                        <Box
                            key={item}
                            component="img"
                            src={`public/${item}`}
                            sx={{
                                width: "100%",
                                flex: 1,
                                objectFit: "cover",
                                opcaity: 0.9,
                                transition: "all 0.3s ease-in-out",
                                cursor: "pointer",
                                "&:hover": {
                                    opacity: 1,
                                    filter: "brightness(1.1)",
                                    transform: "scale(1.01)",
                                    zIndex: 1
                                }
                            }}
                        />
                    ))}
                </Box>
            ))}
            <Box sx={{
                height: "100%",
                flex: 3,
                display: "flex",
                flexDirection: "column",
                p: 2
            }}>
                <Box sx={{
                    flex: 1
                }}>
                    <Box
                        component="img"
                        src="public/StravoskaLogoFinal.png"
                        sx={{
                            maxHeight: "100%",
                            maxWidth: "100%",
                            objectFit: 'contain'
                        }}
                    />
                </Box>
                <Box sx={{
                    flex: 3,
                    bgcolor: "background.paper",
                    borderRadius: 2,
                    border: 1,
                    borderColor: "primary.main"
                }}>
                    <Outlet />
                </Box>
                <Box sx={{
                    flex: 1
                }}>

                </Box>
            </Box>
        </Box>
    );
};