import re
from fastapi import HTTPException, status

def validate_season_format(season: str) -> bool:
    """
    Valide le format AAAA-AAAA (ex: 2025-2026).
    """
    pattern = r'^\d{4}-\d{4}$'
    if not re.match(pattern, season):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Le format de la saison doit être AAAA-AAAA (ex: 2025-2026)."
        )
    
    # Vérifier que la deuxième année est bien l'année suivante
    start_year, end_year = season.split('-')
    if int(end_year) != int(start_year) + 1:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Les deux années d'une saison doivent être consécutives."
        )
    return True
