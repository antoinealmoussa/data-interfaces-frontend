from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import ApiCreateUser
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