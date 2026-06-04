# Cours DevOps - Partie 2 : Approfondissement Docker

## Vue d'ensemble - Points abordés dans cette Partie 2

*Aperçu rapide de tout ce qui est vu aujourd'hui*

### 📚 Théories

- **Networks Docker**
  - Types de networks (bridge, host, overlay, none)
  - DNS automatique entre conteneurs
  - Isolation réseau entre services

- **Variables d'environnement et configuration**
  - environment vs env_file
  - Fichier .env et .env.example
  - Ordre de priorité des variables

- **Expose vs Ports**
  - Différence EXPOSE (documentation) vs ports (exposition réelle)
  - Isolation de la base de données

- **Debug et Troubleshooting**
  - Commandes de diagnostic essentielles (inspect, logs, stats, exec, top, history)
  - Erreurs classiques et leurs solutions

- **Optimisation d'images Docker**
  - Images Alpine vs images standard (tableau de comparaison)
  - Multi-stage builds
  - .dockerignore et npm ci

- **Healthchecks et availability**
  - Différence entre "started" et "healthy"
  - Configuration de healthchecks dans Dockerfile et compose
  - Conditions de dépendance (service_healthy vs service_started)

---

### 🛠 Mises en pratique

- **Debug de Dockerfiles cassés**
  - Dockerfile #1 : correction de la syntaxe CMD
  - Dockerfile #2 : optimisation de l'ordre des COPY pour le cache
  - Dockerfile #3 : réduction de taille avec Alpine et multi-stage

- **Debug de docker-compose.yml**
  - Identification d'erreurs de configuration
  - Ajout de healthchecks pour Postgres
  - Correction de problèmes de connectivité entre services

- **Challenge d'optimisation d'images**
  - Création d'un .dockerignore
  - Conversion vers image Alpine
  - Implémentation de multi-stage build
  - Utilisation de `npm ci --only=production`
  - Comparaison des tailles avant/après

- **Commandes Docker utilisées**
  - `docker --version`, `docker compose version`
  - `docker run` (avec options `-it`, `--name`, `-v`, `-p`, `--rm`, `--mount`)
  - `docker build -t`
  - `docker images`, `docker ps`, `docker stop`, `docker rm`
  - `docker logs -f`, `docker inspect`, `docker stats`, `docker top`
  - `docker exec -it`
  - `docker volume` (create, ls, inspect, rm)
  - `docker compose` (up, down, build, logs, ps)
  - `docker system prune`
  - `docker cp` (copie de fichiers)

---

## 1 - Networks Docker : Maîtriser la Communication entre Conteneurs

### L'essentiel

#### C'est quoi un network Docker ?

Un network Docker est un réseau virtuel qui permet à vos conteneurs de communiquer entre eux de manière isolée et sécurisée. Sans network, vos conteneurs sont comme des îles isolées qui ne peuvent pas se parler.

Quand vous lancez plusieurs conteneurs (API, base de données, cache), ils doivent pouvoir échanger des données. Le network Docker crée un **pont de communication** entre eux.

### Pourquoi utiliser des networks Docker ?

**Problème sans network personnalisé :**

```bash
# Vous lancez un conteneur PostgreSQL
docker run --name example-api node:22-alpine sleep infinity

# Vous lancez votre API
docker run --name example-api-2 node:22-alpine sleep infinity
```

Ici L'API ne peut pas se connecter à ma-db
Pourquoi ? Ils ne sont pas sur le même réseau !

**Solution avec network :**

```bash
# Créer un network
docker network create shared-network

# Lancer les conteneurs sur ce network
docker run -d -p 3000:3000 --name example-api --network example-network node:22-alpine sleep infinity
docker run -d -p 8080:8080 --name example-api-2 --network example-network node:22-alpine sleep infinity

# Maintenant l'API peut se connecter à "ma-db" directement !

# Essayer de se connecter à l'autre api avec curl
# Installation
apk add curl
# Essai
curl http://example-api-2:8080

=> faire 2 api simples dockerisées
```

### Les 4 types de networks Docker

#### 1. Bridge (par défaut)

- Network le plus courant
- Conteneurs sur le même host peuvent communiquer
- Isolés du réseau externe (sauf si ports exposés)
- Docker crée automatiquement un bridge network appelé "bridge"

#### 2. Host

- Conteneur partage le réseau de l'hôte
- Pas d'isolation réseau
- Performance maximale (pas de traduction de ports)
- Attention aux conflits de ports

#### 3. Overlay

- Pour Docker Swarm (orchestration multi-serveurs)
- Permet la communication entre conteneurs sur différents hosts
- On ne l'utilisera pas dans ce cours

#### 4. None

- Aucun réseau
- Conteneur complètement isolé
- Utile pour des tâches qui ne nécessitent pas de réseau

### Comment ça marche concrètement ?

**DNS automatique :** Quand vous mettez des conteneurs sur un même network custom, Docker active un DNS automatique. Chaque conteneur peut être atteint par son nom.

```yaml
# docker-compose.yml
services:
  api:
    image: mon-api
    networks:
      - mon-network

  database:
    image: postgres
    networks:
      - mon-network

networks:
  mon-network:
```

Dans le conteneur `api`, vous pouvez faire :

```js
// Se connecter à la base de données par son nom
const db = new Database({
  host: 'database', // Le nom du service !
  port: 5432
});
```

### Isolation réseau

Les conteneurs sur des networks différents ne peuvent PAS communiquer entre eux (sauf configuration explicite).

```
Network A          Network B
├── api            ├── front
└── db             └── nginx

api peut parler à db
front peut parler à nginx
Mais api ne peut PAS parler à front
```

### Commandes essentielles

```bash
# Lister les networks
docker network ls

# Créer un network
docker network create mon-network

# Inspecter un network (voir quels conteneurs sont dessus)
docker network inspect mon-network

# Connecter un conteneur existant à un network
docker network connect mon-network mon-conteneur

# Déconnecter un conteneur d'un network
docker network disconnect mon-network mon-conteneur

# Supprimer un network (aucun conteneur ne doit l'utiliser)
docker network rm mon-network

# Nettoyer tous les networks non utilisés
docker network prune
```

---

## EXERCICE GUIDÉ 1 : Créer et utiliser un network custom

**Objectif :** Créer deux conteneurs qui communiquent via un network personnalisé

### Étape 1 : Créer le network

```bash
docker network create app-network
```

### Étape 2 : Lancer un conteneur "serveur"

```bash
# On lance un conteneur Alpine qui restera actif
docker run -dit --name serveur --network app-network alpine sh

# Installer des outils réseau dedans
docker exec serveur apk add --no-cache curl
```

### Étape 3 : Lancer un conteneur "client"

```bash
docker run -dit --name client --network app-network alpine sh

# Installer les outils
docker exec client apk add --no-cache curl
```

### Étape 4 : Tester la communication

```bash
# Depuis le client, pinguer le serveur par son nom
docker exec client ping -c 3 serveur

# Vous devriez voir des réponses !
# PING serveur (172.X.X.X): 56 data bytes
# 64 bytes from 172.X.X.X: seq=0 ttl=64 time=0.XXX ms
```

### Étape 5 : Inspecter le network

```bash
docker network inspect app-network

# Vous verrez les deux conteneurs listés avec leurs IPs
```

### Étape 6 : Tester l'isolation

```bash
# Créer un second network
docker network create other-network

# Lancer un conteneur sur cet autre network
docker run -dit --name isole --network other-network alpine sh

# Essayer de pinguer depuis le client
docker exec client ping -c 3 isole

# Ça échoue ! "ping: bad address 'isole'"
# Les conteneurs sur des networks différents ne se voient pas
```

### Nettoyage :

```bash
docker stop serveur client isole
docker rm serveur client isole
docker network rm app-network other-network
```

---

## EXERCICE GUIDÉ 2 : Network dans docker-compose

**Objectif :** Créer une architecture avec plusieurs networks pour isoler les services

**Scénario :** On veut une API qui communique avec une BDD, mais on veut que la BDD ne soit PAS accessible depuis l'extérieur.

**Créer un fichier docker-compose.yml :**

```yaml
version: '3.8'

services:
  api:
    image: node:18-alpine
    command: sh -c "while true; do sleep 3600; done"
    networks:
      - frontend
      - backend
    ports:
      - "3000:3000"

  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: secret
    networks:
      - backend # Seulement sur le backend

  nginx:
    image: nginx:alpine
    networks:
      - frontend # Seulement sur le frontend
    ports:
      - "80:80"

networks:
  frontend:  # Network pour l'exposition publique
  backend:   # Network privé pour la BDD
```

**Analyse de l'architecture :**

- `nginx` et `api` sont sur le network `frontend`
- `api` et `database` sont sur le network `backend`
- `nginx` ne peut PAS communiquer directement avec `database` (isolation)
- `api` est sur les deux networks (pont entre les deux)

**Tester :**

```bash
# Lancer la stack
docker compose up -d

# Vérifier les networks créés
docker network ls | grep network

# Nginx peut atteindre l'API
docker compose exec nginx ping -c 2 api

# Nginx ne peut PAS atteindre la BDD
docker compose exec nginx ping -c 2 database
# Erreur attendue !

# Mais l'API peut atteindre la BDD
docker compose exec api ping -c 2 database
```

**Nettoyage :**

```bash
docker compose down
```

---

## 2 - Variables d'Environnement et Configuration

### L'essentiel

#### C'est quoi une variable d'environnement ?

Une variable d'environnement est une valeur (texte, nombre, URL) que vous passez à votre conteneur pour configurer son comportement sans modifier le code source.

Au lieu de coder en dur :

```js
const dbHost = "localhost"; // En dur, mauvaise pratique
```

On utilise une variable d'environnement :

```js
const dbHost = process.env.DB_HOST; // Flexible !
```

### Pourquoi utiliser des variables d'environnement ?

#### 1. Séparation du code et de la configuration

- Le même code peut tourner en développement, staging, production
- Juste en changeant les variables

#### 2. Sécurité

- Les secrets (mots de passe, clés API) ne sont jamais dans le code
- Pas de risque de commit accidentel sur GitHub

#### 3. Flexibilité

- Changement de configuration sans rebuild de l'image
- Différentes configurations selon l'environnement

### Comment passer des variables d'environnement ?

**Méthode 1 : Via docker run**

```bash
docker run -e DB_HOST=postgres -e DB_PORT=5432 mon-image
```

**Méthode 2 : Via docker-compose.yml (inline)**

```yaml
services:
  api:
    image: mon-api
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - NODE_ENV=production
```

**Méthode 3 : Via docker-compose.yml (syntaxe objet)**

```yaml
services:
  api:
    image: mon-api
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      NODE_ENV: production
```

**Méthode 4 : Via un fichier .env**

```bash
# Créer un fichier .env
DB_HOST=postgres
DB_PORT=5432
NODE_ENV=production
```

```yaml
# docker-compose.yml
services:
  api:
    image: mon-api
    env_file:
      - .env
```

### Différence entre environment et env_file

**environment :** Variables explicites dans docker-compose.yml
- Avantage : tout est visible dans le fichier
- Inconvénient : on commit souvent le docker-compose.yml (risque de leak)

**env_file :** Variables dans un fichier séparé
- Avantage : on peut ajouter .env dans .gitignore (sécurité)
- Inconvénient : moins visible, fichier à maintenir séparément

**Bonne pratique :** Utiliser les deux !

```yaml
services:
  api:
    image: mon-api
    environment:
      NODE_ENV: production  # Pas sensible, peut être commité
    env_file:
      - .env  # Contient les secrets, dans .gitignore
```

### Ordre de priorité des variables

Si une même variable est définie à plusieurs endroits, voici l'ordre (du plus prioritaire au moins) :

1. Variables passées avec `docker run -e`
2. Variables dans `environment:` du docker-compose.yml
3. Variables dans le fichier référencé par `env_file:`
4. Variables dans le Dockerfile (ENV)
5. Valeurs par défaut dans le code

### Sécurité des secrets

**Mauvaise pratique :**

```yaml
# docker-compose.yml (commité sur GitHub)
services:
  api:
    environment:
      DB_PASSWORD: super_secret_123  # Visible sur GitHub !
```

**Bonne pratique :**

```bash
# .env (dans .gitignore)
DB_PASSWORD=super_secret_123
```

```yaml
# docker-compose.yml
services:
  api:
    env_file:
      - .env  # Le fichier .env n'est jamais commité
```

```
# .gitignore
.env
```

**Encore mieux (pour la production) :** Utiliser Docker Secrets ou des outils comme Vault, mais on ne le verra pas dans ce cours.

### Utiliser les variables dans le code

**Node.js :**

```js
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PASSWORD = process.env.DB_PASSWORD;

if (!DB_PASSWORD) {
  throw new Error('DB_PASSWORD must be defined');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Connecting to database at ${DB_HOST}`);
});
```

### Variables avec des valeurs par défaut

```yaml
services:
  api:
    environment:
      DB_HOST: ${DB_HOST:-postgres}  # Si DB_HOST n'existe pas, utilise "postgres"
      DB_PORT: ${DB_PORT:-5432}
```

---

## EXERCICE GUIDÉ 1 : Passer des variables d'environnement

**Objectif :** Créer une petite API qui lit des variables d'environnement

### Étape 1 : Créer le code de l'API

```js
// server.js
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY;
const ENVIRONMENT = process.env.NODE_ENV || 'development';

app.get('/config', (req, res) => {
  res.json({
    port: PORT,
    hasApiKey: !!API_KEY,
    environment: ENVIRONMENT,
    message: `Running in ${ENVIRONMENT} mode`
  });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Environment: ${ENVIRONMENT}`);
  console.log(`API Key provided: ${!!API_KEY}`);
});
```

### Étape 2 : Créer le Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
RUN npm init -y && npm install express
COPY server.js .
CMD ["node", "server.js"]
```

### Étape 3 : Tester avec docker run

```bash
# Build l'image
docker build -t env-test .

# Lancer sans variables
docker run -p 3000:3000 env-test
# Regarder les logs : mode development, pas d'API key

# Lancer avec variables
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e API_KEY=secret123 \
  -e PORT=3000 \
  env-test

# Tester
curl http://localhost:3000/config
```

### Étape 4 : Utiliser docker-compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      API_KEY: secret123
      PORT: 3000
```

```bash
docker compose up
curl http://localhost:3000/config
```

---

## EXERCICE GUIDÉ 2 : Utiliser un fichier .env

**Objectif :** Séparer les secrets dans un fichier .env

### Étape 1 : Créer le fichier .env

```bash
# .env
NODE_ENV=production
API_KEY=super_secret_key_123
DB_HOST=postgres
DB_PORT=5432
DB_PASSWORD=db_secret_password
```

### Étape 2 : Modifier docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "${PORT:-3000}:3000"  # Utilise PORT du .env ou 3000 par défaut
    env_file:
      - .env
```

### Étape 3 : Ajouter .env au .gitignore

```bash
echo ".env" >> .gitignore
```

### Étape 4 : Créer un .env.example (template pour l'équipe)

```bash
# .env.example (ce fichier EST commité)
NODE_ENV=development
API_KEY=your_api_key_here
DB_HOST=postgres
DB_PORT=5432
DB_PASSWORD=your_password_here
```

### Étape 5 : Tester

```bash
docker compose up
curl http://localhost:3000/config
```

**Chaque membre de l'équipe :**

1. Clone le repo
2. Copie .env.example vers .env
3. Remplit ses propres valeurs
4. Lance `docker compose up`

---

## 3 - Expose vs Ports : Comprendre l'Exposition des Services

### L'essentiel

#### C'est quoi la différence ?

**expose :** Documente quel port le conteneur écoute, mais ne l'expose PAS à l'extérieur

**ports :** Expose réellement le port à la machine hôte

C'est une source de confusion fréquente, alors clarifions.

### La directive EXPOSE dans le Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
EXPOSE 3000  # Documentation uniquement !
CMD ["node", "server.js"]
```

Cette ligne `EXPOSE 3000` est **purement documentaire**. Elle dit : "Hey, cette application écoute sur le port 3000 à l'intérieur du conteneur"

Mais elle ne rend PAS le port accessible depuis votre machine.

### La directive ports dans docker-compose.yml

```yaml
services:
  api:
    build: .
    ports:
      - "3000:3000"  # Exposition réelle !
```

Cette ligne crée un **mapping de port** :
- Port 3000 de votre machine → Port 3000 du conteneur
- Maintenant vous pouvez accéder à http://localhost:3000

### Pourquoi deux mécanismes différents ?

**EXPOSE (dans Dockerfile) :**
- Documentation pour les développeurs
- Indique l'intention du créateur de l'image
- Utilisé par des outils d'orchestration (Kubernetes)
- N'a aucun effet sur l'accessibilité réseau

**ports (dans docker-compose ou -p avec docker run) :**
- Exposition réelle du service
- Décision de déploiement (pas de l'image)
- Permet l'accès depuis l'hôte ou l'extérieur

### Syntaxes de ports dans docker-compose

**Syntaxe courte :**

```yaml
ports:
  - "3000:3000"  # host:conteneur
  - "8080:80"    # hôte sur 8080, conteneur sur 80
```

**Syntaxe longue (plus explicite) :**

```yaml
ports:
  - target: 3000      # Port du conteneur
    published: 3000   # Port de l'hôte
    protocol: tcp
```

**Exposer sur localhost uniquement (sécurité) :**

```yaml
ports:
  - "127.0.0.1:3000:3000"  # Accessible seulement depuis la machine locale
```

**Port dynamique (assigné par Docker) :**

```yaml
ports:
  - "3000"  # Docker choisit un port aléatoire sur l'hôte
```

### Cas d'usage : quand utiliser expose vs ports

**Utilisez expose quand :**
- Services internes qui communiquent uniquement entre conteneurs
- Base de données accessible seulement par l'API
- Services dans un même docker-compose

**Exemple :**

```yaml
services:
  api:
    ports:
      - "3000:3000"  # Accessible depuis l'extérieur

  database:
    image: postgres
    expose:
      - "5432"  # Seulement accessible par api, pas depuis l'hôte
```

**Utilisez ports quand :**
- Services qui doivent être accessibles depuis votre machine
- APIs publiques
- Interfaces web
- Services de développement

### Sécurité et isolation

**Mauvaise pratique :**

```yaml
services:
  database:
    image: postgres
    ports:
      - "5432:5432"  # La BDD est accessible depuis l'extérieur !
```

N'importe qui sur votre réseau peut tenter de se connecter à votre base de données.

**Bonne pratique :**

```yaml
services:
  api:
    ports:
      - "3000:3000"

  database:
    image: postgres
    # Pas de ports ! Seulement accessible via le network Docker
```

L'API peut se connecter à la BDD via le network Docker, mais la BDD n'est pas exposée à l'extérieur.

---

## EXERCICE GUIDÉ : Comprendre expose vs ports

**Objectif :** Créer une architecture où la BDD n'est pas exposée à l'hôte

### Étape 1 : Créer une API simple qui se connecte à PostgreSQL

```js
// app.js
const express = require('express');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const client = new Client({
  host: process.env.DB_HOST || 'database',
  port: 5432,
  user: 'postgres',
  password: process.env.DB_PASSWORD,
  database: 'testdb'
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/db-test', async (req, res) => {
  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    await client.end();
    res.json({
      success: true,
      time: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
```

### Étape 2 : Créer le docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"  # Exposé à l'hôte
    environment:
      DB_HOST: database
      DB_PASSWORD: secret
    depends_on:
      - database

  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: testdb
    # Pas de ports ! Seulement accessible via le network interne
```

### Étape 3 : Tester l'isolation

```bash
# Lancer la stack
docker compose up -d

# L'API est accessible
curl http://localhost:3000/health

# L'API peut se connecter à la BDD
curl http://localhost:3000/db-test

# Mais vous ne pouvez PAS vous connecter à la BDD depuis votre machine
psql -h localhost -U postgres -d testdb
# Connection refused ! (normal, le port n'est pas exposé)
```

### Étape 4 : Exposer la BDD pour le debug (temporaire)

Modifiez le docker-compose.yml :

```yaml
database:
  image: postgres:15-alpine
  ports:
    - "5432:5432"  # Maintenant exposé
  environment:
    POSTGRES_PASSWORD: secret
    POSTGRES_DB: testdb
```

```bash
docker compose down
docker compose up -d

# Maintenant vous pouvez vous connecter depuis l'hôte
psql -h localhost -U postgres -d testdb
# Succès !
```

En production, retirez le `ports:` pour sécuriser la base de données.

---

## 4 - Debug & Troubleshooting : Aide-mémoire

### L'essentiel

### Commandes de diagnostic essentielles

```bash
# Voir les logs en temps réel
docker compose logs -f api
docker compose logs --tail=100 --since 30m api

# Inspecter un conteneur
docker inspect mon-conteneur
docker inspect --format='{{.State.Status}}' mon-conteneur
docker inspect --format='{{.NetworkSettings.IPAddress}}' mon-conteneur

# Voir les stats (CPU, RAM)
docker stats --no-stream

docker top mon-conteneur

# Entrer dans un conteneur
docker exec -it mon-conteneur sh

# Voir les layers d'une image
docker history mon-image

# Conteneur qui crash : voir les logs même arrêté
docker logs conteneur-qui-crash
docker run -it --entrypoint sh mon-image

# Nettoyer
docker system prune -a --volumes
```

### Erreurs courantes et solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| `port already allocated` | Port déjà utilisé sur l'hôte | `lsof -i :3000`, changer le port hôte |
| `no space left on device` | Disque plein | `docker system df`, puis `docker system prune -a` |
| `network not found` | Network supprimé ou inexistant | `docker compose down && docker compose up` |
| `service unhealthy` | Healthcheck échoue | `docker logs` + `docker inspect` pour voir le log du healthcheck |
| `connection refused` | Service pas encore prêt | Ajouter `depends_on` avec `service_healthy` |
| `unable to find image` | Typo ou image inexistante | Vérifier le nom, `docker pull` |

---

## 5 - Optimisation d'Images

### L'essentiel

### Comparaison des images de base

| Image | Taille | Remarque |
|-------|--------|----------|
| `node:18` | ~910 MB | Image complète Debian |
| `node:18-slim` | ~170 MB | Debian sans outils inutiles |
| `node:18-alpine` | ~110 MB | Alpine Linux, idéal pour la prod |

**Attention avec Alpine :** certains packages npm compilent du code natif. Si `npm install` échoue, ajouter `apk add --no-cache python3 make g++` avant l'installation.

### Multi-stage build

On compile dans un stage "builder" et on ne copie que le résultat dans l'image finale. Les outils de build et les devDependencies ne finissent jamais dans la prod.

```dockerfile
# Stage 1 : Build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2 : Production (image petite)
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

### .dockerignore

Toujours exclure ce qui ne doit pas entrer dans le contexte de build :

```
node_modules
npm-debug.log
.git
.env
*.md
tests/
coverage/
dist/
.vscode/
```

### npm ci vs npm install

```dockerfile
# Lent et non-déterministe
RUN npm install

# Rapide, déterministe, respecte package-lock.json
RUN npm ci --only=production
```

`npm ci` est fait pour la CI/CD : plus rapide, ne modifie jamais `package-lock.json`, installe exactement ce qui est déclaré.

### Ordre des layers pour le cache

```dockerfile
# Bon : package.json copié en premier (change rarement)
COPY package*.json ./
RUN npm ci --only=production
COPY . .  # Change souvent → ne recalcule pas npm ci
```

---

## 6 - Healthchecks et Availability

### L'essentiel

### Started vs Healthy : la distinction clé

Un conteneur `STARTED` = le processus tourne. Un conteneur `HEALTHY` = le service répond vraiment.

Sans healthcheck, `depends_on` attend seulement que le conteneur démarre. PostgreSQL prend 5-10 secondes pour être prêt : l'API qui démarre trop tôt crash.

```yaml
services:
  api:
    depends_on:
      database:
        condition: service_healthy  # attend que database soit HEALTHY, pas juste STARTED

  database:
    image: postgres:15-alpine
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
      start_period: 10s
```

### HEALTHCHECK dans le Dockerfile

```dockerfile
# Installer curl pour le healthcheck
RUN apk add --no-cache curl

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

- `--interval` : délai entre deux tests
- `--start-period` : délai avant le premier test (laisser le service démarrer)
- `--retries` : nombre d'échecs avant de passer à UNHEALTHY

### HEALTHCHECK dans docker-compose

```yaml
services:
  api:
    build: .
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

**Référence rapide pour PostgreSQL :**

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 5s
  timeout: 5s
  retries: 5
```

### Voir le statut

```bash
docker ps
# STATUS affiche : (healthy) / (health: starting) / (unhealthy)

docker inspect --format='{{json .State.Health}}' mon-conteneur
```

---

## Mise en pratique - Après-midi

- Former groupes : obligatoire
- Repository obligatoire
  - Readme :
    - Nom de chaque membre
  - Commits de chaque membre du groupe obligatoire

---

## 7 - Debug & Troubleshooting : Devenir un Pro du Diagnostic

### L'essentiel

### Les commandes de debug essentielles

*Pour votre information, afin que cela vous serve plus tard.*

```bash
# Inspecter un conteneur en détail
docker inspect mon-conteneur

# Voir les logs en temps réel
docker logs -f mon-conteneur

# Voir les stats (CPU, RAM, réseau)
docker stats

# Lister les processus dans un conteneur
docker top mon-conteneur

# Rentrer dans un conteneur en cours d'exécution
docker exec -it mon-conteneur sh

# Voir l'historique des layers d'une image
docker history mon-image
```

### Les erreurs classiques et leurs solutions

| Erreur | Cause probable | Solution |
|--------|----------------|----------|
| `port already allocated` | Port déjà utilisé | Changer le port hôte |
| `no space left on device` | Disque plein | `docker system prune` |
| `connection refused` | Service pas démarré | Vérifier les logs |
| `unable to find image` | Typo ou image inexistante | Vérifier le nom |

---

## Exercice Pratique 3 : Débugger des Dockerfiles Cassés

**Objectif :** Je vous donne des Dockerfiles avec des erreurs, trouvez-les !

### Dockerfile #1 : L'erreur subtile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD npm start
```

**Questions :**

1. Buildez cette image : `docker build -t debug-1 .`
2. Que se passe-t-il ?
3. Identifiez le problème (indice : regardez les logs de build)

### Dockerfile #2 : L'ordre compte !

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "server.js"]
```

**Questions :**

1. Ce Dockerfile fonctionne, mais quel est le problème de performance ?
2. Modifiez une ligne de code dans `src/`
3. Rebuilder : `docker build -t debug-2 .`
4. Que remarquez-vous ?

### Dockerfile #3 : L'image géante

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

**Questions :**

1. Buildez : `docker build -t debug-3 .`
2. Vérifiez la taille : `docker images debug-3`
3. Pourquoi l'image fait-elle plus de 1GB ?

**CHECKPOINT 3 :**

- Quelqu'un partage son écran et montre comment il a debuggé
- "Quelle commande utilisez-vous pour voir pourquoi un conteneur crash au démarrage ?"
- Discussion : autres erreurs rencontrées aujourd'hui ?

---

## Exercice Pratique 4 : Débugger un docker-compose.yml

**Fichier docker-compose-broken.yml :**

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - database
    environment:
      DB_HOST: postgres
      DB_PORT: 5432

  database:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: secret
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data
```

**Tâches :**

1. Lancez : `docker compose -f docker-compose-broken.yml up`
2. L'application ne se connecte pas à la BDD. Pourquoi ?
3. Corrigez le fichier

**CHECKPOINT 4 :**

- "Quelle commande pour voir les logs d'un seul service dans docker-compose ?"
- Quelqu'un explique le concept de healthcheck

---

## 8 - Optimisation d'Images Docker

### L'essentiel

### Pourquoi optimiser ?

| Image | Taille | Impact |
|-------|--------|--------|
| `node:18` | 910 MB | Lent à pull, coûteux en stockage |
| `node:18-slim` | 170 MB | Mieux, mais peut manquer des outils |
| `node:18-alpine` | 110 MB | Petit, rapide, sécurisé |

### Les 5 techniques d'optimisation

#### 1. Utiliser des images Alpine

```dockerfile
FROM node:18-alpine  # Au lieu de node:18
```

#### 2. Multi-stage builds

```dockerfile
# Stage 1 : Build
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 : Production (on ne garde que le nécessaire)
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/server.js"]
```

#### 3. .dockerignore (comme .gitignore)

```
node_modules
npm-debug.log
.git
.env
*.md
tests/
coverage/
```

#### 4. Combiner les commandes RUN

```dockerfile
# Mauvais : 3 layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get clean

# Bon : 1 layer
RUN apt-get update && \
    apt-get install -y curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

#### 5. Ordre des COPY

```dockerfile
# Bon ordre (cache efficace)
COPY package*.json ./
RUN npm install
COPY . .

# Mauvais ordre (cache invalidé souvent)
COPY . .
RUN npm install
```

---

## Exercice Pratique 5 : Challenge d'Optimisation

**Objectif :** Réduire au maximum la taille de votre Todo App

### Dockerfile de départ (non optimisé)

```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "src/server.js"]
```

### Votre mission

1. **Buildez la version de départ**

```bash
docker build -t todo-v1 .
docker images todo-v1
# Noter la taille
```

2. **Appliquez TOUTES les optimisations**
   - Image Alpine
   - Multi-stage build
   - .dockerignore
   - Ordre optimal des layers
   - `npm ci --only=production`

3. **Comparez les résultats**

```bash
docker build -t todo-v2-optimized .
docker images | grep todo
```

4. **Calculez le gain**

```bash
# Exemple de résultat attendu :
# todo-v1             1.2GB
# todo-v2-optimized   150MB
# Gain : 87%
```

**Compétition :** Qui obtient l'image la plus petite (tout en fonctionnant) ?

**CHECKPOINT 5 :**

- Partage d'écran : les 3 meilleures optimisations
- "Pourquoi `npm ci` est meilleur que `npm install` en production ?"
- Discussion : compromis entre taille et fonctionnalités