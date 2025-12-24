import httpx
import xml.etree.ElementTree as ET
from src.api_economy_feed.schemas import ApiEconomyFeed
from src.api_economy_feed.utils.datetimes import extract_date_from_str_datetime, extract_hour_from_str_datetime


async def fetch_economy_rss_feed():
    url = "https://www.economie.gouv.fr/rss/toutesactualites"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        root_response = ET.fromstring(response.content)

        return root_response.find("channel")


def extract_item_from_channel(channel, limit: int | None) -> ApiEconomyFeed:
    items = channel.findall(
        "item")[:limit] if limit else channel.findall("item")
    economyFeed = [{
        "title": item.findtext("title"),
        "link": item.findtext("link"),
        "pubDate": extract_date_from_str_datetime(item.findtext("pubDate")),
        "pubHour": extract_hour_from_str_datetime(item.findtext("pubDate"))
    } for item in items]

    return ApiEconomyFeed(economyFeed=economyFeed)
