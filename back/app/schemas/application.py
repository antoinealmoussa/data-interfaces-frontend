from pydantic import BaseModel

# --- Schéma de base ---


class ApiReturnApplication(BaseModel):
    id: int
    name: str
    pretty_name: str
