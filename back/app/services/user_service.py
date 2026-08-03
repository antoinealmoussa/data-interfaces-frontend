from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import ApiCreateUser, ApiUpdateUser


def get_user_by_email(db: Session, email: str) -> User | None:
    return UserRepository(db).get_by_email(email)


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return UserRepository(db).get_by_id(user_id)


def create_user(db: Session, user_in: ApiCreateUser) -> User:
    existing_user = get_user_by_email(db, user_in.email)
    if existing_user:
        raise ValueError("Cet email est déjà utilisé.")

    hashed_pw = hash_password(user_in.password)
    return UserRepository(db).create_user(user_in, hashed_pw)


def authenticate_user(db: Session, email: str, password: str) -> User | bool:
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

def revoke_tokens(db: Session, user: User) -> User:
    return UserRepository(db).bump_token_version(user)


def update_user(db: Session, user_id: int, user_in: ApiUpdateUser) -> User | None:
    user = get_user_by_id(db, user_id)
    if not user:
        return None

    update_data = user_in.model_dump(exclude_unset=True)
    if "email" in update_data:
        existing_user = get_user_by_email(db, update_data["email"])
        if existing_user and existing_user.id != user_id:
            raise ValueError("Cet email est déjà utilisé par un autre utilisateur.")

    return UserRepository(db).update_user(user_id, user_in)
