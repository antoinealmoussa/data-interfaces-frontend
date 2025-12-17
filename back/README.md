# Architecture du repo

```bash
mon_projet/
├── front/                      # Front-end React + TypeScript
├── back/                       # Dossier pour tous tes services back
│   ├── service1/               # Service FastAPI 1
│   ├── service2/               # Service FastAPI 2
│   └── ...
├── data/                       # Notebooks et scripts data science
├── docker-compose.yml          # Orchestration de tous les services
├── README.md                   # Documentation globale
└── .gitignore                  # Ignore les fichiers inutiles (node_modules, venv, etc.)
```

# Création d'un service back en Python

## Initialisation d'un projet Poetry

```bash
poetry init
poetry add fastapi uvicorn sqlalchemy psycopg2-binary
```
