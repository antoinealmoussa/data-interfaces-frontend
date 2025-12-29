# Étape 1 : Utilise une image Python officielle
FROM python:3.12-slim AS builder

# Installe Poetry
RUN pip install poetry

# Configure Poetry pour ne pas créer d'environnement virtuel
ENV POETRY_VIRTUALENVS_CREATE=false

# Copie les fichiers de configuration de Poetry
WORKDIR /app
COPY . .

# Installe les dépendances
RUN poetry install --no-interaction --no-ansi

# Étape 2 : Image finale légère
FROM python:3.12-slim
WORKDIR /app

# Copie les dépendances installées depuis le builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copie le code source
COPY . .

# Expose le port utilisé par FastAPI
EXPOSE 8000

# Commande pour lancer l'application
CMD ["uvicorn", "src.api_authentication.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
