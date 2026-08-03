from app.db.repository import BaseRepository
from app.models.application import Application
from app.models.user import User
from app.schemas.user import ApiCreateUser, ApiReturnUser, ApiUpdateUser


class UserRepository(BaseRepository[User, ApiReturnUser]):
    model_class = User
    return_schema = ApiReturnUser

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def create_user(
        self, user_in: ApiCreateUser, hashed_password: str, role_id: int
    ) -> User:
        db_user = user_in.to_model(hashed_password, role_id)
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update_user(self, user_id: int, data: ApiUpdateUser) -> User | None:
        db_user = self.get_by_id(user_id)
        if not db_user:
            return None
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(db_user, field, value)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def bump_token_version(self, user: User) -> User:
        user.token_version += 1
        self.db.commit()
        self.db.refresh(user)
        return user

    def add_application(self, user: User, app: Application) -> None:
        if app not in user.applications:
            user.applications.append(app)
            self.db.commit()

    def remove_application(self, user: User, app: Application) -> None:
        if app in user.applications:
            user.applications.remove(app)
            self.db.commit()
