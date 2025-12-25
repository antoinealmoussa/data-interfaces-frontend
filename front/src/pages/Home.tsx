import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArticleCard } from "../components/ui/ArticleCard";

interface economyItem {
    title: string;
    link: string;
    pubDate: string;
    pubHour: string;
}

interface ApiEconomyNews {
    economyFeed: economyItem[] | undefined;
}

export const Home = () => {
    const [economyNews, setEconomyNews] = useState<ApiEconomyNews | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const columnItemsAmount = 3;
    const rowItemsAmount = 3;
    const itemsAmount = columnItemsAmount * rowItemsAmount

    useEffect(() => {
        const fetchData = async () => {
            setError(null);
            try {
                const response = await axios.get<ApiEconomyNews>(
                    `http://localhost:8001/economy-news/?limit=${itemsAmount}`
                );
                setEconomyNews(response.data);
            } catch (error) {
                const errorMessage = "Une erreur inconnue est survenue";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [])

    const economyItems: economyItem[] | undefined = economyNews?.economyFeed;

    return (
        <Box
            sx={{
                p: 3,
                flex: 1,
                overflow: 'auto',
                display: 'flex',
                flexWrap: 'wrap',
                height: "100%",
                width: '100%'
            }}
        >
            {loading ? "Chargement des données..." : null}
            {error && <p style={{ color: "red" }}>Erreur : {error}</p>}
            {economyItems && economyItems.map((item) => (
                <ArticleCard
                    title={item.title}
                    pubDate={item.pubDate}
                    pubHour={item.pubHour}
                    link={item.link}
                />
            ))}
        </Box >
    );
};
