from typing import Any, Generic, TypeVar

from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import Base

ModelType = TypeVar("ModelType", bound=Base)
ReturnSchemaType = TypeVar("ReturnSchemaType", bound=BaseModel)


def _model_fields(model_class: type) -> set[str]:
    return {
        *model_class.__table__.columns.keys(),
        *model_class.__mapper__.relationships.keys(),
    }


class BaseRepository(Generic[ModelType, ReturnSchemaType]):
    model_class: type[ModelType]
    return_schema: type[ReturnSchemaType]

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, entity_id: int) -> ModelType | None:
        return self.db.query(self.model_class).filter(
            self.model_class.id == entity_id
        ).first()

    def get_many(
        self, skip: int = 0, limit: int = 100, **filters: Any
    ) -> list[ModelType]:
        q = self.db.query(self.model_class)
        for attr, value in filters.items():
            q = q.filter(getattr(self.model_class, attr) == value)
        return q.offset(skip).limit(limit).all()

    def create(self, data: BaseModel, **extra_fields: Any) -> ReturnSchemaType:
        model_fields = _model_fields(self.model_class)
        model_data = {
            k: v for k, v in data.model_dump().items()
            if k in model_fields
        }
        db_obj = self.model_class(**model_data, **extra_fields)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return self.return_schema.model_validate(db_obj)

    def update(
        self, entity_id: int, data: BaseModel
    ) -> ReturnSchemaType | None:
        db_obj = self.get_by_id(entity_id)
        if not db_obj:
            return None
        model_fields = _model_fields(self.model_class)
        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field in model_fields:
                setattr(db_obj, field, value)
        self.db.commit()
        self.db.refresh(db_obj)
        return self.return_schema.model_validate(db_obj)

    def delete(self, entity_id: int) -> bool:
        db_obj = self.get_by_id(entity_id)
        if not db_obj:
            return False
        self.db.delete(db_obj)
        self.db.commit()
        return True
