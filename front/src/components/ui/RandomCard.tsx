import { Card, CardContent, Typography } from "@mui/material";
import { randomWord, randomSentence } from "../../utils/randomData";

export const RandomCard: React.FC = () => {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6">{randomWord()}</Typography>
                <Typography color="textSecondary" className="mt-2">
                    {randomSentence()}
                </Typography>
            </CardContent>
        </Card>
    );
};
