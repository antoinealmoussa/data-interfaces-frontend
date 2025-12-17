import { List, ListItem, ListItemText, Typography, Button } from "@mui/material";
import { randomWord } from "../../utils/randomData";

export const Sidebar: React.FC = () => {
    return (
        <div className="w-64 bg-white p-4 shadow-md h-full">
            <Typography variant="h6" className="font-bold mb-4">
                Menu
            </Typography>
            <List>
                {Array.from({ length: 5 }).map((_, i) => (
                    <ListItem key={i} disablePadding>
                        <ListItemText
                            primary={
                                <Button fullWidth className="justify-start">
                                    {randomWord()}
                                </Button>
                            }
                        />
                    </ListItem>
                ))}
            </List>
        </div>
    );
};
