from app.db.repository import BaseRepository
from app.models.user import User
from app.schemas.user import ApiReturnUser


class UserRepository(BaseRepository[User, ApiReturnUser]):
    model_class = User
    return_schema = ApiReturnUser

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()
