from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from src.api_economy_feed.schemas import ApiEconomyFeed
from src.api_economy_feed.services.economy_rss_feed import fetch_economy_rss_feed, extract_item_from_channel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(
    "/economy-news",
    response_model=ApiEconomyFeed
)
async def get_economy_news(limit: int | None = None):
    try:
        economy_channel = await fetch_economy_rss_feed()

        remodeled = extract_item_from_channel(economy_channel, limit)

        return remodeled
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
