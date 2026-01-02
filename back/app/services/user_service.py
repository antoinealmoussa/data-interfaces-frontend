from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import ApiCreateUser
from app.core.security import PasswordHelper


def get_all_users(db: Session):
    return db.query(User).all()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_in: ApiCreateUser):
    hashed_pw = PasswordHelper.hash_password(user_in.password)
    db_user = User(
        email=user_in.email,
        hashed_password=hashed_pw,
        first_name=user_in.first_name,
        surname=user_in.surname
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not PasswordHelper.verify_password(password, user.hashed_password):
        return False
    return user
