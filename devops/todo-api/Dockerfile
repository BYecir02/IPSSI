# Étape 1 : Build (Installation des dépendances)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Étape 2 : Production (Image finale légère)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Installation uniquement des dépendances de production
RUN npm ci --only=production
# Copie du code source et des fichiers nécessaires depuis l'étape précédente ou le host
COPY . .
# On s'assure que node_modules de prod est bien là (écrasant celui du COPY si besoin)
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["node", "server.js"]
