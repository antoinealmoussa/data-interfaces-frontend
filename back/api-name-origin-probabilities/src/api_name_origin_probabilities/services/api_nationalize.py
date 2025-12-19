import httpx
from src.api_name_origin_probabilities.schemas import ApiNationalize, ApiNameOriginProbabilities
from src.api_name_origin_probabilities.country import get_country_by_alias
from fastapi import HTTPException
from sqlalchemy.orm import Session


async def fetch_nationalize_api_data(name: str) -> ApiNationalize:
    url = f"https://api.nationalize.io?name={name}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()


def replace_alias_by_country_name(alias: str, db: Session) -> str:
    try:
        return get_country_by_alias(alias, db).name
    except HTTPException:
        print("Country not found in database")
        return alias


def remodel_data(original_data: ApiNationalize, db: Session) -> ApiNameOriginProbabilities:
    return ApiNameOriginProbabilities(
        probabilities=[{
            "x": replace_alias_by_country_name(country["country_id"], db),
            "y": round(country["probability"], 4)
        } for country in original_data["country"]]
    )
