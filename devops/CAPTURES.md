# Preuves DevOps - Todo API

## 1. Versions des outils
```bash
$ docker --version
Docker version 28.5.2, build ecc6942

$ docker-compose --version
Docker Compose version v2.40.3-desktop.1
```

## 2. État des conteneurs (Docker Compose)
Commande : `docker-compose up -d --build`
```text
[+] Building 4.3s (14/14) FINISHED
 => [builder 4/4] RUN npm install                                                                                                                                                            0.0s 
 => [stage-1 4/6] RUN npm ci --only=production                                                                                                                                               0.0s 
 => exporting to image                                                                                                                                                                              0.3s 
 => => naming to docker.io/library/todo-api-api:latest                                                                                                                                              0.0s 

[+] Running 4/4
 ✔ todo-api-api              Built                                                                                                                                                                  0.0s 
 ✔ Network todo-api_default  Created                                                                                                                                                                0.3s 
 ✔ Container todo-api-api-1  Started                                                                                                                                                                3.5s 
 ✔ Container todo-api-db-1   Started                                                                                                                                                                3.5s 
```

## 3. Liste des conteneurs actifs
```bash
$ docker ps
CONTAINER ID   IMAGE                COMMAND                  STATUS          PORTS                                         NAMES
68f38d7c85ea   postgres:15-alpine   "docker-entrypoint.s…"   Up 19 seconds   0.0.0.0:5433->5432/tcp, [::]:5433->5432/tcp   todo-api-db-1
635b7e99e088   todo-api-api         "docker-entrypoint.s…"   Up 19 seconds   0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp   todo-api-api-1
```

## 4. Logs de l'API (Initialisation BDD)
```bash
$ docker-compose logs api
api-1  | Server is running on port 3000
api-1  | Database initialized
```

## 5. Tests des Endpoints API (curl)
### Health Check
```bash
$ curl http://localhost:3000/health
{"status":"ok","timestamp":"2026-06-03T14:32:16.311Z"}
```

### Liste des tâches (Initialement vide)
```bash
$ curl http://localhost:3000/api/tasks
[]
```

## 6. Volumes Docker
```bash
$ docker volume ls | grep todo-api
DRIVER    VOLUME NAME
local     todo-api_api-logs
local     todo-api_postgres-data
```
