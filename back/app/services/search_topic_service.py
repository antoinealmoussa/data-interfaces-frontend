import httpx
from app.prompts.search_topic_prompt import SEARCH_TOPIC_PROMPT

MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_API_KEY = "K6lug86H5Apg6E5SlBQnHAcEOZaZrnOE"
MISTRAL_MODEL = "mistral-small"


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
                MISTRAL_API_URL,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {MISTRAL_API_KEY}",
                },
                json={
                    "model": MISTRAL_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 500,
                },
            )
            response.raise_for_status()  # Lève une exception si le statut HTTP est une erreur
            return response.json()["choices"][0]["message"]["content"]

        except httpx.HTTPStatusError as e:
            status_code = e.response.status_code
            error_message = error_messages.get(
                status_code, f"Erreur HTTP inattendue : {status_code}"
            )
            return {"status": status_code, "error": error_message}
