# Todo API - Projet DevOps IPSSI

Ce projet consiste en la création d'une API REST de gestion de tâches (Todo App) développée avec Node.js, conteneurisée avec Docker et orchestrée avec Docker Compose.

## 🚀 Journal de progression

### Étape 1 : Initialisation et Structure
- [x] Création de l'arborescence du projet (`src/routes`, `src/models`, `src/middleware`).
- [x] Initialisation de NPM et installation des dépendances de base (`express`, `cors`, `helmet`).
- [x] Configuration du `.gitignore`.

### Étape 2 : Implémentation du Code de Base
- [x] Création du serveur Express (`src/app.js`).
- [x] Mise en place du point d'entrée (`server.js`).
- [x] Ajout d'un middleware de gestion d'erreurs global.

### Étape 3 : Fonctionnalités CRUD (Version Mémoire)
- [x] Installation de `uuid` pour la gestion des identifiants.
- [x] Implémentation des routes CRUD complètes dans `src/routes/tasks.js` :
    - `POST /api/tasks` : Créer une tâche.
    - `GET /api/tasks` : Lister les tâches.
    - `GET /api/tasks/:id` : Voir une tâche.
    - `PUT /api/tasks/:id` : Modifier une tâche.
    - `DELETE /api/tasks/:id` : Supprimer une tâche.
- [x] Stockage temporaire des données en mémoire (tableau).

### Étape 4 : Dockerisation (Image seule)
- [x] Création du `.dockerignore`.
- [x] Création du `Dockerfile` (Node.js 18 Alpine).
- [x] Build de l'image (`todo-api:1.0`).
- [x] Lancement et validation du conteneur.

### Étape 5 : Restructuration
- [x] Création du dossier `devops/`.
- [x] Déplacement de l'API et des ressources de cours dans `devops/`.
- [x] Mise à jour de la documentation.

---

## 🛠️ Installation et Lancement (Local)

### Prérequis
- Node.js (v18+)
- npm
- Docker

### Installation & Lancement Classique
1. Naviguer dans le dossier :
   ```bash
   cd devops/todo-api
   ```
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Lancer :
   ```bash
   npm start
   ```

### Lancement avec Docker
1. Build l'image :
   ```bash
   docker build -t todo-api:1.0 ./devops/todo-api
   ```
2. Lancer le conteneur :
   ```bash
   docker run -d -p 3000:3000 --name todo-container todo-api:1.0
   ```
L'API sera accessible sur `http://localhost:3000`.

---

## 📡 API Endpoints (Résumé)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | Check de l'état de l'API |
| GET | `/api/tasks` | Liste toutes les tâches |
| GET | `/api/tasks/:id` | Détails d'une tâche |
| POST | `/api/tasks` | Créer une tâche |
| PUT | `/api/tasks/:id` | Modifier une tâche |
| DELETE| `/api/tasks/:id` | Supprimer une tâche |
