import { List, ListItem, ListItemText, Typography } from "@mui/material";
import { randomWord } from "../../utils/randomData";

export const RandomList: React.FC = () => {
    return (
        <div className="mb-6">
            <Typography variant="h6" className="font-semibold mb-2">
                Liste aléatoire
            </Typography>
            <List>
                {Array.from({ length: 5 }).map((_, i) => (
                    <ListItem key={i}>
                        <ListItemText primary={randomWord()} />
                    </ListItem>
                ))}
            </List>
        </div>
    );
};
