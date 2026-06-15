import re

TEAM_CATEGORIES: list[str] = ["Mixte", "+35", "+50", "Open féminin", "Open masculin"]


def validate_season_format(season: str) -> bool:
    """
    Valide le format AAAA-AAAA (ex: 2025-2026).
    """
    pattern = r'^\d{4}-\d{4}$'
    if not re.match(pattern, season):
        raise ValueError(
            "Le format de la saison doit être AAAA-AAAA (ex: 2025-2026)."
        )

    start_year, end_year = season.split('-')
    if int(end_year) != int(start_year) + 1:
        raise ValueError(
            "Les deux années d'une saison doivent être consécutives."
        )
    return True
