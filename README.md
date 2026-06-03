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

---

## 🛠️ Installation et Lancement (Local)

### Prérequis
- Node.js (v18+)
- npm

### Installation
1. Naviguer dans le dossier :
   ```bash
   cd todo-api
   ```
2. Installer les dépendances :
   ```bash
   npm install
   ```

### Lancement
```bash
npm start
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
