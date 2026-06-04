# Procédure de déploiement - Todo API

## 1. Prérequis
- Accès au cluster K3S (fichier kubeconfig dans ~/.kube/config)
- Variables CI/CD configurées dans GitHub/GitLab : DOCKERHUB_USER, DOCKERHUB_TOKEN, KUBE_CONFIG
- Branche `main` à jour et tests verts en local

## 2. Déploiement (nominal)
1. Merger la branche de feature dans `main` via merge request (après review)
2. Le merge déclenche la pipeline automatiquement
3. Suivre la pipeline : GitHub Actions > CI
4. Stages attendus : test-unit > test-integration > build-and-push > deploy, tous verts

## 3. Vérification
- `kubectl get pods` : tous les pods en Running
- `kubectl rollout status deployment/todo-api` : rollout complete
- `curl http://localhost:3000/health` : doit répondre {"status":"ok"}

## 4. Rollback (si le déploiement casse)
1. `kubectl rollout undo deployment/todo-api`
2. `kubectl rollout status deployment/todo-api` → attendre "successfully rolled out"
3. `kubectl get pods` → tous Running
4. `curl http://localhost:3000/health` → {"status":"ok"}

## 5. Contacts
- Responsable déploiement : Mohamed Yecir Badirou
