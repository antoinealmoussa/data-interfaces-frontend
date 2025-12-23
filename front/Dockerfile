# Utilise une image Node.js légère pour le développement
FROM node:22-alpine

# Définis le répertoire de travail
WORKDIR /app

# Copie les fichiers de configuration et installe les dépendances
COPY package.json package-lock.json ./
RUN npm install

# Copie le reste du code
COPY . .

# Expose le port utilisé par Vite (par défaut 5173)
EXPOSE 5173

# Commande pour lancer Vite en mode développement
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
