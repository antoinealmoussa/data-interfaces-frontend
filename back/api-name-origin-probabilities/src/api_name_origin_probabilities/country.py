from typing import List
from fastapi import HTTPException, Depends, APIRouter, Query
from sqlalchemy.orm import Session
from starlette import status
import src.api_name_origin_probabilities.models as models
from src.api_name_origin_probabilities.schemas import CreateCountry, CountryBase
from src.api_name_origin_probabilities.database import get_db

router = APIRouter(
    prefix='/countries',
    tags=['Countries']
)


@router.get('/', response_model=List[CreateCountry], status_code=status.HTTP_200_OK)
def get_countries(db: Session = Depends(get_db)):
    countries = db.query(models.Country).all()

    return countries


@router.get('/by-alias', response_model=CreateCountry, status_code=status.HTTP_200_OK)
def get_country_by_alias(
    alias: str,
    db: Session = Depends(get_db)
) -> CountryBase:
    if not alias:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No alias requested")

    idv_country = db.query(models.Country).filter(
        models.Country.alias == alias).first()

    if not idv_country:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"The alias {alias} requested for does not exist")

    return CountryBase(
        alias=idv_country.alias,
        name=idv_country.name
    )


@router.get('/{id}', response_model=CreateCountry, status_code=status.HTTP_200_OK)
def get_country_by_id(id: int, db: Session = Depends(get_db)):
    idv_country = db.query(models.Country).filter(
        models.Country.id == id).first()

    if idv_country is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"The id {id} requested for does not exist")

    return idv_country


@router.post('/', status_code=status.HTTP_201_CREATED, response_model=List[CreateCountry])
def create_country(post_country: CreateCountry, db: Session = Depends(get_db)):
    new_country = models.Country(**post_country.model_dump())
    db.add(new_country)
    db.commit()
    db.refresh(new_country)

    return [new_country]


@router.delete('/{id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_country(id: int, db: Session = Depends(get_db)):
    deleted_country = db.query(models.Country).filter(models.Country.id == id)

    if deleted_country.first() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"The id {id} requested for does not exist")

    deleted_country.delete(synchronize_session=False)
    db.commit()


@router.put('/{id}', response_model=CreateCountry)
def update_country(update_country: CountryBase, id: int, db: Session = Depends(get_db)):
    updated_country = db.query(models.Country).filter(models.Country.id == id)

    if updated_country.first() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail=f"The id {id} requested for does not exist")

    updated_country.update(update_country.model_dump(),
                           synchronize_session=False)
    db.commit()

    return updated_country.first()
