# Plan de Développement - Création de la première équipe

## Objectif

Permettre à un coach, lors de sa première connexion, d'être guidé pour créer sa première équipe avec validation des champs obligatoires.

## Architecture Existante

- **Backend** : FastAPI + SQLAlchemy + Pydantic
  - Modèles : `back/app/models/`
  - Schémas : `back/app/schemas/`
  - Services : `back/app/services/`
  - Endpoints API : `back/app/api/v1/endpoints/`
  - Router central : `back/app/api/v1/api_router.py`
  - Migrations SQL : `migrations/`

- **Frontend** : React + TypeScript + MUI + Axios
  - Pages : `front/src/pages/`
  - Composants : `front/src/components/`
  - Types : `front/src/types/`
  - API : `front/src/api/`
  - Routes : `front/src/routes.tsx`

## User Story : Création de la première équipe lors de la première connexion

### Titre

En tant que coach, je veux être guidé pour créer ma première équipe lors de ma première connexion, avec validation des champs obligatoires.

### Description

Contexte : Un coach vient de créer son compte et se connecte pour la première fois à l'application. Il n'a encore aucune équipe assignée.
Besoin : L'application doit détecter qu'il n'a pas d'équipe et lui proposer un formulaire de création d'équipe avec des champs spécifiques. Le formulaire doit valider les entrées avant de permettre la création.
Bénéfice attendu : Expérience utilisateur fluide dès la première utilisation, avec une validation claire des données pour éviter les erreurs.

### Critères d'acceptation

#### Détection automatique :

- L'application vérifie que l'utilisateur n'a aucune équipe assignée à son compte.
- Si c'est le cas, elle affiche automatiquement un formulaire de création d'équipe.

#### Formulaire de création d'équipe :

- **Nom de l'équipe** :
  - Champ libre (texte).
  - Obligatoire.
  - Longueur maximale : 50 caractères.
- **Saison** :
  - Champ libre au format AAAA-AAAA (ex: 2025-2026).
  - Obligatoire.
  - Validation automatique : si le format n'est pas respecté (ex: 2025/2026, 25-26, ou 2025), un message d'erreur s'affiche : "Le format de la saison doit être AAAA-AAAA (ex: 2025-2026)."
- **Catégories jouées** :
  - Choix multiple parmi : "Mixte", "+35", "+50", "Open féminin", "Open masculin".
  - Au moins une catégorie doit être sélectionnée.

#### Validation et feedback :

- Si un champ obligatoire est manquant ou invalide, le formulaire affiche un message d'erreur clair sous le champ concerné.
- Le bouton "Créer l'équipe" est désactivé tant que tous les champs ne sont pas valides.
- Une fois le formulaire validé, l'équipe est créée et l'utilisateur est redirigé vers le tableau de bord avec un message de confirmation : "Votre équipe [Nom] a été créée avec succès pour la saison [Saison] !"

#### Cas d'erreur :

- Si la création échoue (ex: problème serveur), un message d'erreur générique s'affiche : "Une erreur est survenue. Veuillez réessayer."
- Les champs du formulaire restent pré-remplis pour éviter à l'utilisateur de tout ressaisir.

### Dépendances

- US-001 (Créer un compte pour accéder à l'application).

### Exemples de scénarios

#### Scénario nominal :

L'utilisateur saisit :

- Nom : "Les Loups Rugbymen"
- Saison : "2025-2026"
- Catégories : "Mixte", "Open masculin"
  → L'équipe est créée avec succès.

#### Scénario d'erreur (saison invalide) :

L'utilisateur saisit :

- Nom : "Les Loups Rugbymen"
- Saison : "2025/2026"
- Catégories : "Mixte"
  → Message d'erreur : "Le format de la saison doit être AAAA-AAAA (ex: 2025-2026)."
  Le bouton "Créer l'équipe" reste désactivé.

#### Scénario d'erreur (catégorie non sélectionnée) :

L'utilisateur saisit :

- Nom : "Les Loups Rugbymen"
- Saison : "2025-2026"
- Catégories : (aucune sélection)
  → Message d'erreur : "Veuillez sélectionner au moins une catégorie."

## Tâches de Développement

### 1. Backend - Modèle de Données

**Fichier : `back/app/models/season.py`** (nouveau modèle)

```python
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.session import Base

class Season(Base):
    __tablename__ = "season"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(9), nullable=False, unique=True)  # Format AAAA-AAAA (9 chars max), unique

    teams = relationship("Team", secondary="team_season", back_populates="seasons")
```

**Fichier : `back/app/models/team_season.py`** (nouveau - table de jonction)

```python
from sqlalchemy import Column, Integer, ForeignKey, PrimaryKeyConstraint
from app.db.session import Base

class TeamSeason(Base):
    __tablename__ = "team_season"

    team_id = Column(Integer, ForeignKey("team.id"), nullable=False)
    season_id = Column(Integer, ForeignKey("season.id"), nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint('team_id', 'season_id'),
    )
```

**Fichier : `back/app/models/team.py`** (mis à jour)

```python
from sqlalchemy import Column, Integer, String, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from app.db.session import Base

class Team(Base):
    __tablename__ = "team"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False)  # Max 50 caractères
    categories = Column(ARRAY(String), nullable=False)  # Ex: ["Mixte", "+35"]
    user_id = Column(Integer, ForeignKey("user_stravoska.id"))

    user = relationship("User", back_populates="teams")
    seasons = relationship("Season", secondary="team_season", back_populates="teams")
```

**Mise à jour : `back/app/models/user.py`** (inchangé, la relation avec Team existe déjà)

```python
from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship, Mapped
from app.db.session import Base
from app.models.user_application import user_application
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.application import Application

class User(Base):
    __tablename__ = "user_stravoska"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    token_version = Column(Integer, default=0)

    applications: Mapped[List["Application"]] = relationship(
        "Application", secondary=user_application, back_populates="users"
    )
    teams = relationship("Team", back_populates="user")
```

**Mise à jour : `back/app/models/__init__.py`**

```python
from app.models.user import User
from app.models.application import Application
from app.models.user_application import user_application
from app.models.team import Team
from app.models.season import Season
from app.models.team_season import TeamSeason
```

### 1.5 Backend - Validation de la saison (utilitaire)

**Fichier : `back/app/utils/validators.py`** (nouveau)

```python
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
```

### 2. Backend - Schémas Pydantic

**Fichier : `back/app/schemas/season.py`** (nouveau - lecture seule)

```python
from pydantic import BaseModel, ConfigDict, field_validator
from app.utils.validators import validate_season_format

class SeasonBase(BaseModel):
    name: str  # Format AAAA-AAAA

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        validate_season_format(v)
        return v

class ApiReturnSeason(SeasonBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
```

**Fichier : `back/app/schemas/team.py`** (mis à jour - création uniquement)

```python
from pydantic import BaseModel, ConfigDict, field_validator
from typing import List, Optional
from app.utils.validators import validate_season_format

class TeamBase(BaseModel):
    name: str
    categories: List[str]  # ["Mixte", "+35", "+50", "Open féminin", "Open masculin"]
    user_id: int
    season_name: str  # Nom de la saison (ex: "2025-2026")

    @field_validator('name')
    @classmethod
    def validate_name(cls, v):
        if len(v) > 50:
            raise ValueError('Le nom de l\'équipe ne doit pas dépasser 50 caractères')
        if not v.strip():
            raise ValueError('Le nom de l\'équipe est obligatoire')
        return v

    @field_validator('season_name')
    @classmethod
    def validate_season_name(cls, v):
        if not v or v.strip() == "":
            raise ValueError('Veuillez sélectionner une saison.')
        validate_season_format(v)
        return v

    @field_validator('categories')
    @classmethod
    def validate_categories(cls, v):
        if not v or len(v) == 0:
            raise ValueError('Veuillez sélectionner au moins une catégorie.')
        valid_categories = ["Mixte", "+35", "+50", "Open féminin", "Open masculin"]
        for cat in v:
            if cat not in valid_categories:
                raise ValueError(f'Catégorie invalide: {cat}')
        return v

class ApiCreateTeam(TeamBase):
    pass

class ApiReturnTeam(TeamBase):
    id: int
    seasons: List[ApiReturnSeason]  # Saisons associées (une seule lors de la création)
    model_config = ConfigDict(from_attributes=True)
```

### 3. Backend - Service Métier

**Fichier : `back/app/services/season_service.py`** (nouveau - lecture seule pour les utilisateurs)

```python
from sqlalchemy.orm import Session
from app.models.season import Season
from app.schemas.season import ApiCreateSeason
from fastapi import HTTPException, status

def get_seasons(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Season).offset(skip).limit(limit).all()

def get_season_by_id(db: Session, season_id: int):
    return db.query(Season).filter(Season.id == season_id).first()

def get_season_by_name(db: Session, name: str):
    return db.query(Season).filter(Season.name == name).first()

def create_season_if_not_exists(db: Session, season_name: str):
    """Crée la saison si elle n'existe pas encore. Retourne l'objet Season."""
    existing = get_season_by_name(db, season_name)
    if existing:
        return existing

    db_season = Season(name=season_name)
    db.add(db_season)
    db.commit()
    db.refresh(db_season)
    return db_season
```

**Fichier : `back/app/services/team_service.py`** (mis à jour - création uniquement avec une seule saison)

```python
from sqlalchemy.orm import Session
from app.models.team import Team
from app.models.season import Season
from app.schemas.team import ApiCreateTeam, ApiReturnTeam
from fastapi import HTTPException, status
from app.services import season_service

def get_teams_by_user(db: Session, user_id: int):
    return db.query(Team).filter(Team.user_id == user_id).all()

def get_teams_by_season(db: Session, season_id: int):
    return db.query(Team).join(TeamSeason).filter(TeamSeason.season_id == season_id).all()

def has_user_teams(db: Session, user_id: int) -> bool:
    """Vérifie si l'utilisateur a au moins une équipe."""
    return db.query(Team).filter(Team.user_id == user_id).count() > 0

def get_team_by_id(db: Session, team_id: int):
    return db.query(Team).filter(Team.id == team_id).first()

def create_team(db: Session, team_in: ApiCreateTeam):
    # Créer ou récupérer la saison (une seule)
    season = season_service.create_season_if_not_exists(db, team_in.season_name)

    # Créer l'équipe
    db_team = Team(
        name=team_in.name,
        categories=team_in.categories,
        user_id=team_in.user_id
    )
    db_team.seasons = [season]

    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team
```

### 4. Backend - Endpoints API (lecture seule + création équipe uniquement)

**Fichier : `back/app/api/v1/endpoints/seasons.py`** (lecture seule pour les utilisateurs)

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.season import ApiReturnSeason

router = APIRouter()

@router.get("/", response_model=List[ApiReturnSeason])
def read_seasons(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return season_service.get_seasons(db, skip=skip, limit=limit)

@router.get("/{season_id}", response_model=ApiReturnSeason)
def read_season(season_id: int, db: Session = Depends(get_db)):
    season = season_service.get_season_by_id(db, season_id)
    if not season:
        raise HTTPException(status_code=404, detail="Saison non trouvée")
    return season
```

**Fichier : `back/app/api/v1/endpoints/teams.py`** (création uniquement)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.team import ApiCreateTeam, ApiReturnTeam
from app.services import team_service
from app.core.token import get_current_active_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[ApiReturnTeam])
def read_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.get_teams_by_user(db, user_id=current_user.id)

@router.get("/has-teams", response_model=bool)
def check_user_has_teams(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.has_user_teams(db, user_id=current_user.id)

@router.get("/by-season/{season_id}", response_model=List[ApiReturnTeam])
def read_teams_by_season(
    season_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return team_service.get_teams_by_season(db, season_id=season_id)

@router.post("/", response_model=ApiReturnTeam, status_code=status.HTTP_201_CREATED)
def create_team(team_in: ApiCreateTeam, db: Session = Depends(get_db)):
    return team_service.create_team(db, team_in=team_in)
```

**Fichier : `back/app/api/v1/api_router.py`** (mis à jour)

```python
from fastapi import APIRouter
from app.api.v1.endpoints import users, search_topic, teams, seasons

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(search_topic.router, prefix="/search", tags=["Search"])
api_router.include_router(teams.router, prefix="/teams", tags=["Teams"])
api_router.include_router(seasons.router, prefix="/seasons", tags=["Seasons"])
```

### 5. Backend - Migration SQL

**Fichier : `migrations/004_create-team-and-season.sql`** (mis à jour avec noms singuliers)

```sql
CREATE TABLE season (
    id SERIAL PRIMARY KEY,
    name VARCHAR(9) NOT NULL UNIQUE
);

CREATE TABLE team (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    categories TEXT[] NOT NULL,
    user_id INTEGER REFERENCES user_stravoska(id)
);

CREATE TABLE team_season (
    team_id INTEGER REFERENCES team(id),
    season_id INTEGER REFERENCES season(id),
    PRIMARY KEY (team_id, season_id)
);
```

### 6. Frontend - Types

**Fichier : `front/src/types/seasonTypes.ts`** (lecture seule)

```typescript
export interface Season {
  id: number;
  name: string; // Format AAAA-AAAA
}
```

**Fichier : `front/src/types/teamTypes.ts`** (création uniquement)

```typescript
import { Season } from "./seasonTypes";

export const TEAM_CATEGORIES = [
  "Mixte",
  "+35",
  "+50",
  "Open féminin",
  "Open masculin",
] as const;

export type TeamCategory = (typeof TEAM_CATEGORIES)[number];

export interface Team {
  id: number;
  name: string;
  categories: TeamCategory[];
  user_id: number;
  seasons: Season[]; // Saisons associées
}

export interface CreateTeamDto {
  name: string;
  categories: TeamCategory[];
  user_id: number;
  season_name: string; // Nom de la saison (ex: "2025-2026")
}
```

### 7. Frontend - API Service (lecture seule + création)

**Fichier : `front/src/api/seasonApi.ts`** (lecture seule)

```typescript
import axios from "axios";
import API_URLS from "./config";
import { Season } from "../types/seasonTypes";

const SEASON_URL = `${API_URLS.backend}/seasons`;

export const seasonApi = {
  getAll: () => axios.get<Season[]>(SEASON_URL),
  getById: (id: number) => axios.get<Season>(`${SEASON_URL}/${id}`),
};
```

**Fichier : `front/src/api/teamApi.ts`** (création uniquement)

```typescript
import axios from "axios";
import API_URLS from "./config";
import { Team, CreateTeamDto } from "../types/teamTypes";

const TEAM_URL = `${API_URLS.backend}/teams`;

export const teamApi = {
  getAll: () => axios.get<Team[]>(TEAM_URL),
  getBySeason: (seasonId: number) =>
    axios.get<Team[]>(`${TEAM_URL}/by-season/${seasonId}`),
  hasTeams: async (): Promise<boolean> => {
    try {
      const response = await axios.get<{ has_teams: boolean }>(
        `${TEAM_URL}/has-teams`,
      );
      return response.data.has_teams;
    } catch {
      return false;
    }
  },
  create: (team: CreateTeamDto) => axios.post<Team>(TEAM_URL, team),
};
```

### 8. Frontend - Composant de création de première équipe

**Fichier : `front/src/components/rugby-teams/TeamCreationForm.tsx`** (réutilisable pour créer des équipes)
```typescript
import { Box, Button, TextField, FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox, Alert, Typography, Snackbar, Autocomplete } from "@mui/material";
import { useState, useEffect } from "react";
import { teamApi } from "../../api/teamApi";
import { seasonApi } from "../../api/seasonApi";
import { CreateTeamDto, TEAM_CATEGORIES, TeamCategory } from "../../types/teamTypes";
import { Season } from "../../types/seasonTypes";
import { useNavigate } from "react-router-dom";

interface TeamCreationFormProps {
  userId: number;
  onSuccess?: (team: CreateTeamDto) => void;
}

export const TeamCreationForm = ({ userId, onSuccess }: TeamCreationFormProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateTeamDto>({
    name: "",
    categories: [],
    user_id: userId,
    season_name: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [availableSeasons, setAvailableSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);

  useEffect(() => {
    const loadSeasons = async () => {
      try {
        const response = await seasonApi.getAll();
        setAvailableSeasons(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des saisons:", error);
      }
    };
    loadSeasons();
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Le nom de l'équipe est obligatoire";
    } else if (formData.name.length > 50) {
      newErrors.name = "Le nom ne doit pas dépasser 50 caractères";
    }
    
    if (!formData.season_name) {
      newErrors.season = "Veuillez sélectionner une saison.";
    }
    
    if (formData.categories.length === 0) {
      newErrors.categories = "Veuillez sélectionner au moins une catégorie.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = (): boolean => {
    return !!(
      formData.name.trim() &&
      formData.name.length <= 50 &&
      formData.season_name &&
      formData.categories.length > 0
    );
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, category as TeamCategory]
        : prev.categories.filter(c => c !== category)
    }));
  };

  const handleSeasonChange = (season: Season | null) => {
    setSelectedSeason(season);
    setFormData(prev => ({
      ...prev,
      season_name: season ? season.name : ""
    }));
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const response = await teamApi.create(formData);
      setShowSuccess(true);
      if (onSuccess) {
        onSuccess(response.data);
      }
      setTimeout(() => {
        navigate("/rugby-teams");
      }, 1500);
    } catch (error: any) {
      setSubmitError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Créer une équipe
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Remplissez les informations pour créer une nouvelle équipe.
      </Typography>
      
      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>
      )}
      
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField
          label="Nom de l'équipe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          error={!!errors.name}
          helperText={errors.name || `${formData.name.length}/50 caractères`}
          inputProps={{ maxLength: 50 }}
          fullWidth
        />
        
        <Autocomplete
          options={availableSeasons}
          getOptionLabel={(option) => option.name}
          value={selectedSeason}
          onChange={(_, newValue) => handleSeasonChange(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Saison (ex: 2025-2026)"
              required
              error={!!errors.season}
              helperText={errors.season}
              placeholder="Sélectionnez une saison"
              fullWidth
            />
          )}
        />
        
        <FormControl error={!!errors.categories} required>
          <FormLabel>Catégories jouées</FormLabel>
          <FormGroup>
            {TEAM_CATEGORIES.map((category) => (
              <FormControlLabel
                key={category}
                control={
                  <Checkbox
                    checked={formData.categories.includes(category)}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                  />
                }
                label={category}
              />
            ))}
          </FormGroup>
          {errors.categories && (
            <Typography variant="caption" color="error">{errors.categories}</Typography>
          )}
        </FormControl>
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!isFormValid() || isSubmitting}
          size="large"
          sx={{ mt: 2 }}
        >
          {isSubmitting ? "Création en cours..." : "Créer l'équipe"}
        </Button>
      </Box>
      
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
      >
        <Alert severity="success">
          Équipe créée avec succès !
        </Alert>
      </Snackbar>
    </Box>
  );
};
```

### 9. Frontend - Composant Sidebar (générique et réutilisable)

**Fichier : `front/src/components/layout/GenericSidebar.tsx`** (composant générique)
```typescript
import { List, ListItemButton, ListItemIcon, ListItemText, Divider, Typography, Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export interface SidebarItem {
  label: string;
  path: string;
  icon: JSX.Element;
}

interface GenericSidebarProps {
  items: SidebarItem[];
  teams: Array<{ id: number; name: string }>;
  seasons: Array<{ id: number; name: string }>;
  selectedTeamId: number | null;
  selectedSeasonId: number | null;
  onTeamChange: (teamId: number) => void;
  onSeasonChange: (seasonId: number) => void;
}

export const GenericSidebar = ({ 
  items, 
  teams, 
  seasons, 
  selectedTeamId, 
  selectedSeasonId, 
  onTeamChange, 
  onSeasonChange 
}: GenericSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath.includes(path);

  const handleNavigation = (path: string) => {
    if (selectedTeamId && selectedSeasonId) {
      navigate(`/rugby-teams/${selectedTeamId}/${selectedSeasonId}/${path}`);
    }
  };

  return (
    <Box sx={{ width: 240, bgcolor: 'background.paper', height: '100%', borderRight: 1, borderColor: 'divider' }}>
      <Box sx={{ p: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Équipe</InputLabel>
          <Select
            value={selectedTeamId || ''}
            label="Équipe"
            onChange={(e) => onTeamChange(e.target.value as number)}
          >
            {teams.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Saison</InputLabel>
          <Select
            value={selectedSeasonId || ''}
            label="Saison"
            onChange={(e) => onSeasonChange(e.target.value as number)}
          >
            {seasons.map((season) => (
              <MenuItem key={season.id} value={season.id}>
                {season.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Divider />
      
      <List>
        {items.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={isActive(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
```

**Fichier : `front/src/components/rugby-teams/RugbyTeamsSidebar.tsx`** (wrapper spécifique pour rugby-teams)
```typescript
import { GenericSidebar, SidebarItem } from "../layout/GenericSidebar";
import { Groups, EmojiEvents, FitnessCenter } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { teamApi } from "../../api/teamApi";
import { seasonApi } from "../../api/seasonApi";
import { useNavigate } from "react-router-dom";
import { Team } from "../../types/teamTypes";
import { Season } from "../../types/seasonTypes";

const menuItems: SidebarItem[] = [
  { label: "Gestion d'équipe", path: "team-management", icon: <Groups /> },
  { label: "Tournoi", path: "tournament", icon: <EmojiEvents /> },
  { label: "Entraînement", path: "training", icon: <FitnessCenter /> },
];

export const RugbyTeamsSidebar = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teamsRes, seasonsRes] = await Promise.all([
          teamApi.getAll(),
          seasonApi.getAll()
        ]);
        setTeams(teamsRes.data);
        setSeasons(seasonsRes.data);
        
        if (teamsRes.data.length > 0 && !selectedTeamId) {
          setSelectedTeamId(teamsRes.data[0].id);
        }
        if (seasonsRes.data.length > 0 && !selectedSeasonId) {
          setSelectedSeasonId(seasonsRes.data[0].id);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      }
    };
    loadData();
  }, []);

  return (
    <GenericSidebar
      items={menuItems}
      teams={teams.map(t => ({ id: t.id, name: t.name }))}
      seasons={seasons}
      selectedTeamId={selectedTeamId}
      selectedSeasonId={selectedSeasonId}
      onTeamChange={(teamId) => {
        setSelectedTeamId(teamId);
        if (selectedSeasonId) {
          navigate(`/rugby-teams/${teamId}/${selectedSeasonId}/team-management`);
        }
      }}
      onSeasonChange={(seasonId) => {
        setSelectedSeasonId(seasonId);
        if (selectedTeamId) {
          navigate(`/rugby-teams/${selectedTeamId}/${seasonId}/team-management`);
        }
      }}
    />
  );
};
```

### 10. Frontend - Pages

**Fichier : `front/src/pages/rugby-teams/RugbyTeams.tsx`** (mis à jour : redirection vers première équipe/saison ou création)

```typescript
import { Box, useEffect } from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { teamApi } from "../../api/teamApi";
import { seasonApi } from "../../api/seasonApi";
import { useAuth } from "../../hooks/useAuth";
import { RugbyTeamsSidebar } from "../../components/rugby-teams/RugbyTeamsSidebar";
import { Team } from "../../types/teamTypes";

export const RugbyTeams = () => {
  const [hasTeams, setHasTeams] = useState<boolean | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const checkUserTeams = async () => {
      try {
        const result = await teamApi.hasTeams();
        setHasTeams(result);
        
        // Si pas d'équipes, rediriger vers la création
        if (!result && !location.pathname.includes('first-team-creation')) {
          navigate("/rugby-teams/first-team-creation");
        } else if (result) {
          // Charger les équipes
          const teamsRes = await teamApi.getAll();
          setTeams(teamsRes.data);
          
          // Si on est sur la page principale, rediriger vers la première équipe et la saison la plus récente
          if (location.pathname === "/rugby-teams" || location.pathname === "/rugby-teams/") {
            if (teamsRes.data.length > 0) {
              const firstTeam = teamsRes.data[0];
              const mostRecentSeason = firstTeam.seasons.sort((a, b) => b.name.localeCompare(a.name))[0];
              if (mostRecentSeason) {
                navigate(`/rugby-teams/${firstTeam.id}/${mostRecentSeason.id}/team-management`);
              }
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification des équipes:", error);
        setHasTeams(false);
      }
    };
    checkUserTeams();
  }, [navigate, location.pathname]);

  if (hasTeams === null) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
      <RugbyTeamsSidebar teams={teams} />
      <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
        <Outlet />
      </Box>
    </Box>
  );
};
```

**Fichier : `front/src/pages/rugby-teams/FirstTeamCreation.tsx`** (mis à jour avec TeamCreationForm réutilisable)
```typescript
import { Box, Typography, Alert } from "@mui/material";
import { TeamCreationForm } from "../../components/rugby-teams/TeamCreationForm";
import { useAuth } from "../../hooks/useAuth";
import { useLocation } from "react-router-dom";

export const FirstTeamCreation = () => {
  const { user } = useAuth();
  const location = useLocation();
  const successMessage = location.state?.message;

  return (
    <Box sx={{ p: 3 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>
      )}
      {user && (
        <TeamCreationForm 
          userId={user.id} 
          onSuccess={(team) => {
            console.log("Équipe créée:", team);
          }}
        />
      )}
    </Box>
  );
};
```

### 11. Frontend - Routing avec équipe et saison

**Mise à jour : `front/src/routes.tsx`**

```typescript
import { BikeExploration } from "./pages/bike-exploration/BikeExploration";
import { Home } from "./pages/Home";
import { UserProfile } from "./pages/management/UserProfile";
import { RacePreparation } from "./pages/race-preparation/RacePreparation";
import { RugbyTeams } from "./pages/rugby-teams/RugbyTeams";
import { type AppName, type RouteProps } from "./types/routesTypes";
import { AppNameMapper } from "./types/routesTypes";

export const PRIVATE_STANDARD_ROUTES: Record<string, RouteProps> = {
    HOME: { path: "/", element: <Home /> },
    PROFILE: { path: "/profile", element: <UserProfile /> }
};

export const DYNAMIC_APP_ROUTES: Record<AppName, RouteProps> = {
    [AppNameMapper.BIKE_EXPLORATION]: { path: "/bike-exploration", element: <BikeExploration /> },
    [AppNameMapper.RUGBY_TEAMS]: {
      path: "/rugby-teams",
      element: <RugbyTeams />,
      children: [
        { path: ":teamId/:seasonId/team-management", element: <div>Gestion d'équipe (à implémenter)</div> },
        { path: ":teamId/:seasonId/tournament", element: <div>Tournoi (à implémenter)</div> },
        { path: ":teamId/:seasonId/training", element: <div>Entraînement (à implémenter)</div> },
      ]
    },
    [AppNameMapper.RACE_PREPARATION]: { path: "/race-preparation", element: <RacePreparation /> },
}
```

**Mise à jour : `front/src/types/routesTypes.ts`** (inchangé)

```typescript
export const AppNameMapper = {
  BIKE_EXPLORATION: "bike-exploration",
  RUGBY_TEAMS: "rugby-teams",
  RACE_PREPARATION: "race-preparation",
};
```

## Ordre de Développement Recommandé

1. **Backend** : 
   - Modèles (Season, Team avec table de jonction team_season dans son propre fichier) 
   - Schémas (Season lecture seule + Team création avec une seule saison) 
   - Services (season_service lecture seule + team_service création avec création automatique de saison si nécessaire) 
   - Endpoints (seasons lecture seule + teams création uniquement) 
   - Migrations

2. **Frontend** : 
   - Types (seasonTypes lecture seule + teamTypes création avec season_name) 
   - API (seasonApi lecture seule + teamApi création) 
   - Composants partagés (`GenericSidebar` générique dans `components/shared/`) 
   - Composants spécifiques (`RugbyTeamsSidebar` wrapper + `TeamCreationForm` réutilisable dans `components/rugby-teams/`) 
   - Pages (`RugbyTeams` avec logique de redirection automatique + `FirstTeamCreation` page) 
   - Routing avec paramètres `:teamId/:seasonId` (pas de route `first-team-creation`)

3. **Tests** : Backend (pytest) + Frontend (vitest/react-testing-library)

## Notes sur le Routing et l'Expérience Utilisateur

- Relation Team-Season : Many-to-many (une équipe peut avoir plusieurs saisons, une saison peut avoir plusieurs équipes)
- **Création d'équipe** : Une seule saison est associée lors de la création initiale
- **Expérience simplifiée** :
  - L'utilisateur ne peut pas modifier ou supprimer une équipe existante (création uniquement)
  - L'utilisateur ne peut pas créer, modifier ou supprimer des saisons (lecture seule)
  - Lors de la création d'une équipe, si la saison saisie existe déjà, l'association est faite ; sinon, la saison est créée automatiquement puis associée
- Les équipes et saisons sont gérées via le routing : `/rugby-teams/:teamId/:seasonId/:subroute`
- La navigation entre équipes et saisons se fait via le sidebar (Select dropdowns en lecture seule) qui met à jour l'URL
- Chaque sous-page (team-management, tournament, training) reçoit `teamId` et `seasonId` via les React Router params

## Critères d'Acceptation - Checklist

### Checklist User Story : Création première équipe

- [ ] L'application détecte qu'un utilisateur n'a aucune équipe assignée
- [ ] Le formulaire de création s'affiche automatiquement lors de la première connexion
- [ ] Le nom de l'équipe est obligatoire et limité à 50 caractères
- [ ] La saison est obligatoire et validée au format AAAA-AAAA (ex: 2025-2026)
- [ ] Message d'erreur affiché si format saison invalide : "Le format de la saison doit être AAAA-AAAA (ex: 2025-2026)."
- [ ] Les catégories jouées sont au choix multiple parmi : "Mixte", "+35", "+50", "Open féminin", "Open masculin"
- [ ] Au moins une catégorie doit être sélectionnée (message d'erreur sinon)
- [ ] Le bouton "Créer l'équipe" est désactivé si des champs sont invalides
- [ ] Message de confirmation affiché après création : "Votre équipe [Nom] a été créée avec succès pour la saison [Saison] !"
- [ ] Message d'erreur générique affiché si échec serveur : "Une erreur est survenue. Veuillez réessayer."
- [ ] Les champs restent pré-remplis en cas d'erreur serveur
- [ ] Redirection vers le tableau de bord après création réussie
