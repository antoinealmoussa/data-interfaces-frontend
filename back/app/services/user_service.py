from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import ApiCreateUser, ApiUpdateUser
from app.core.security import hash_password, verify_password


def get_all_users(db: Session):
    return db.query(User).all()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: id):
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_in: ApiCreateUser):
    hashed_pw = hash_password(user_in.password)
    db_user = user_in.to_model(hashed_pw)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

def revoke_tokens(db: Session, user: User) -> User:
    user.token_version += 1
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user_id: int, user_in: ApiUpdateUser) -> User | None:
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user