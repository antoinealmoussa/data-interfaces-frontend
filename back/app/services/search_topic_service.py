import httpx
from fastapi import HTTPException, status
from app.prompts.search_topic_prompt import SEARCH_TOPIC_PROMPT
from app.core.config import settings


def format_prompt(query: str) -> str:
    return SEARCH_TOPIC_PROMPT.format(user_query=query)


async def get_search_result(query: str) -> str:
    error_messages = {
        429: "Trop de requêtes en peu de temps. Veuillez attendre 25 secondes avant de réessayer.",
        401: "Clé d'authentification incorrecte. Veuillez vérifier votre token.",
        400: "Format de requête incorrect. Veuillez vérifier les données envoyées.",
    }

    prompt = format_prompt(query)

    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.post(
                settings.MISTRAL_API_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                },
                json={
                    "model": settings.MISTRAL_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 500,
                },
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]

        except httpx.HTTPStatusError as e:
            status_code = e.response.status_code
            error_message = error_messages.get(
                status_code, f"Erreur HTTP inattendue : {status_code}"
            )
            raise HTTPException(status_code=status_code, detail=error_message)
        except httpx.RequestError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Service Mistral injoignable. Veuillez réessayer plus tard.",
            )
