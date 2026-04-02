from pydantic import BaseModel

# --- Schéma de base ---


class ApiReturnApplication(BaseModel):
    name: str
    pretty_name: str
