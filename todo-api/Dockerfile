# Utilisation d'une image Node.js alpine pour la légèreté
FROM node:18-alpine

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers package.json et package-lock.json
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste des fichiers du projet
COPY . .

# Exposition du port 3000 (celui utilisé par notre application)
EXPOSE 3000

# Commande pour démarrer l'application
CMD ["node", "server.js"]
