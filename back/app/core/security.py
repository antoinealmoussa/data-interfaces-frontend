from passlib.context import CryptContext

# On définit le contexte de chiffrement (bcrypt est lent par design, ce qui est bien !)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class PasswordHelper:
    @staticmethod
    def hash_password(password: str) -> str:
        """Génère un hash sécurisé à partir d'un mot de passe en clair."""
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Vérifie si le mot de passe en clair correspond au hash stocké."""
        return pwd_context.verify(plain_password, hashed_password)
