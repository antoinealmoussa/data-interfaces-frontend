import { Card, CardContent, Typography, Link } from "@mui/material";

interface ArticleCardProps {
    title: string;
    pubDate: string;
    pubHour: string;
    link: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
    title,
    pubDate,
    pubHour,
    link
}) => {
    return (
        <Card sx={{
            width: "31%",
            minHeight: "30%",
            m: 1,
            display: "flex",
            flexDirection: "column"
        }}>
            <CardContent sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column"
            }}>

                <Typography variant="subtitle1">
                    <Link
                        href={link}
                        variant="inherit"
                        color="inherit"
                        underline="hover"
                        rel="noopener"
                        target="_blank"
                    >
                        {title}
                    </Link>
                </Typography>
                <Typography variant="caption" sx={{ mt: "auto" }}>
                    Publié le {pubDate} à {pubHour}
                </Typography>
            </CardContent>
        </Card >
    );
};
