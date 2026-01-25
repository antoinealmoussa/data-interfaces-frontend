from pydantic import BaseModel

# --- Schéma de base ---


class ApiReturnApplication(BaseModel):
    """
    Données requises pour l'inscription.
    Le mot de passe n'est présent qu'ici.
    """
    name: str
    pretty_name: str
