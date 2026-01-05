from pydantic import BaseModel

# --- Schéma de base ---


class UserBase(BaseModel):
    """
    Champs communs partagés entre la création et la lecture.
    """
    email: str
    first_name: str
    surname: str

# --- Schéma pour la Création ---


class ApiCreateUser(UserBase):
    """
    Données requises pour l'inscription.
    Le mot de passe n'est présent qu'ici.
    """
    password: str

# --- Schéma pour la Connexion ---


class ApiLoginUser(BaseModel):
    """
    Données minimales pour s'authentifier.
    """
    email: str
    password: str

# --- Schéma pour la Sortie (Response) ---


class ApiReturnUser(UserBase):
    """
    Données renvoyées par l'API au Frontend.
    On hérite de UserBase pour avoir email, first_name et surname.
    On ajoute l'ID mais on ne renvoie JAMAIS le mot de passe.
    """
    id: int

    model_config = {
        # Permet à Pydantic de lire les attributs des objets SQLAlchemy
        # (ex: user.email au lieu de user["email"])
        "from_attributes": True
    }
