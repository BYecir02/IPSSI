# Todo API - Projet DevOps IPSSI

Ce projet consiste en la création d'une API REST de gestion de tâches (Todo App) développée avec Node.js, conteneurisée avec Docker et orchestrée avec Docker Compose.

## Journal de progression

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

### Étape 6 : Volumes Basiques (Exercice Pratique 1)
- [x] Création d'un volume nommé (`todo-logs`).
- [x] Validation de la persistance des données entre différents conteneurs.
- [x] Test de survie des données après suppression des conteneurs.

### Étape 7 : Orchestration avec Docker Compose
- [x] Création du fichier `docker-compose.yml`.
- [x] Configuration d'un service API et d'un service PostgreSQL.
- [x] Mise en place des volumes pour la persistance des données et des logs.
- [x] Migration du code vers une persistance SQL (PostgreSQL).
- [x] Optimisation du Dockerfile (Multi-stage build).

---

## Installation et Lancement (Local)

### Prérequis
- Node.js (v18+)
- npm
- Docker

### Lancement avec Docker Compose (Recommandé)
1. Naviguer dans le dossier :
   ```bash
   cd devops/todo-api
   ```
2. Lancer les services :
   ```bash
   docker-compose up -d
   ```
L'API sera accessible sur `http://localhost:3000`.

---

## API Endpoints (Résumé)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/health` | Check de l'état de l'API |
| GET | `/api/tasks` | Liste toutes les tâches |
| GET | `/api/tasks/:id` | Détails d'une tâche |
| POST | `/api/tasks` | Créer une tâche |
| PUT | `/api/tasks/:id` | Modifier une tâche |
| DELETE| `/api/tasks/:id` | Supprimer une tâche |

---

## 📅 Gestion de Projet (Agile/Solo)

Pour ce projet solo, j'utilise une approche **Kanban** simplifiée pour suivre l'avancement des tâches :

- **To Do** : (Aucune tâche en attente).
- **In Progress** : Finalisation de la documentation technique.
- **Done** : Initialisation API, Dockerisation, Orchestration Docker Compose, Persistance PostgreSQL, Architecture Model-Route, Tests unitaires et d'intégration, CI/CD Pipeline.

*Note : Les itérations sont quotidiennes avec un "Daily Stand-up" personnel pour valider les objectifs du jour.*

---

## 📄 Preuves DevOps
Les sorties terminales validant le fonctionnement du projet sont disponibles dans le fichier [devops/EVIDENCE.md](devops/EVIDENCE.md).

