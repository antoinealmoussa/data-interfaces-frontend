import bcrypt


def hash_password(password: str) -> str:
    # 1. On transforme le string en bytes (UTF-8)
    password_bytes = password.encode('utf-8')

    # 2. On génère un "sel" (salt)
    salt = bcrypt.gensalt()

    # 3. On hash et on transforme le résultat en string pour la DB
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    return hashed_password.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # On compare le mot de passe en clair avec le hash de la DB
    return bcrypt.checkpw(
        plain_password.encode('utf-8'),
        hashed_password.encode('utf-8')
    )
