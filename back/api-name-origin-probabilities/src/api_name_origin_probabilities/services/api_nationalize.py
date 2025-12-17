import httpx
from src.api_name_origin_probabilities.schemas import ApiNationalize, ApiNameOriginProbabilities


async def fetch_nationalize_api_data(name: str) -> ApiNationalize:
    url = f"https://api.nationalize.io?name={name}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


def remodel_data(original_data: ApiNationalize) -> ApiNameOriginProbabilities:
    return ApiNameOriginProbabilities(
        probabilities=[{
            "x": country["country_id"],
            "y": round(country["probability"], 4)
        } for country in original_data["country"]]
    )
