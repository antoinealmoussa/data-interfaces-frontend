from pydantic import BaseModel
from typing import Optional


class EconomyFeedItem(BaseModel):
    title: str
    link: str
    pubDate: str
    pubHour: str


class ApiEconomyFeed(BaseModel):
    economyFeed: list[EconomyFeedItem]
