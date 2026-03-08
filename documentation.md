# GL26 EcoHome — Documentation Technique

## 1. Résumé Exécutif

EcoHome est une plateforme web éducative autour des gestes écologiques. Elle combine :

- un **frontend** en SolidJS (Vite) avec un module « scènes/jeu »
- un **service Auth** (Go/Gin) pour l’authentification JWT
- un **service Core** (Go/Gin) pour les données métiers (profil, quizz, défis, amis)
- une **base Postgres**
- une **infrastructure Docker** (nginx, certbot, anubis)

Le **calcul d’empreinte carbone** est géré côté front par un graphe de questions. Chaque réponse a une fourchette d’impact (kgCO2e/semaine), additionnée le long d’une branche.

## 2. Architecture Globale

**Composants** :

- `front` (SolidJS) : UI, quizz, scènes, stockage local des résultats
- `auth` (Go/Gin) : identité, JWT, refresh tokens
- `core` (Go/Gin) : profils, amis, quizz, défis, agrégation des données
- `database` (Postgres) : persistance
- `nginx` : reverse proxy
- `anubis` : proxy/filtrage supplémentaire

**Flux principal** :

1. L’utilisateur s’authentifie via `auth`.
2. Le front obtient un JWT et appelle `core` (routes `/users/*`).
3. Le quizz lit ses JSON statiques (front) et calcule l’impact localement.
4. Le score final est POST sur `/users/quizz/result`.

### 2.1 Schéma d’architecture (block diagram)

```
   [Browser]
       |
       v
   [Front: SolidJS]
       |
       v
   [Anubis] ---> [Nginx] ---> [Auth Service] ----> [Postgres]
                   |              |
                   |              v
                   |--------> [Core Service] ---> [Postgres]
```

Notes :

- Le front sert l’UI et consomme les APIs `auth` et `core`.
- `anubis` est configuré comme proxy vers le front.
- `nginx` agit comme reverse proxy (ports 80/443).

## 3. Arborescence du projet

```
apps/
  front/
  auth/
  core/
  database/
  game/
nginx/
certbot/
anubis/
docker-compose.yml
docker-compose-dev.yml
```

## 4. Déploiement & Docker

### 4.1 Docker Compose (prod)

- Fichier : `docker-compose.yml`
- Services exposés :
    - `front` → 3000
    - `auth` → ${AUTH_PORT:-5000}
    - `core` → ${CORE_PORT:-5002}
    - `database` → 5432
    - `nginx` → 80/443
    - `anubis` → 127.0.0.1:8080/9090

Commandes :

```
docker compose -f docker-compose.yml up -d --build
```

### 4.2 Docker Compose (dev)

- Fichier : `docker-compose-dev.yml`
- Usage :

```
docker compose -f docker-compose.yml -f docker-compose-dev.yml up -d --build
```

### 4.3 Ports locaux configurables

- `AUTH_PORT`, `CORE_PORT` (dans `.env` local)
- `.env` ignoré par Git

## 5. Frontend

### 5.1 Stack

- SolidJS
- Vite
- vite-plugin-solid

### 5.2 Routes

Fichier : `apps/front/src/App.tsx`
Routes clés :

- `/` (landing ou home selon session)
- `/home`, `/home2`
- `/trilogique`, `/lobby/:gameId`
- `/login`, `/register`, `/PremiereConnexion`
- `/PreQuizz`, `/Quizz`

### 5.3 Module Quizz (front)

Fichiers :

- `apps/front/src/quizz/Types.ts`
- `apps/front/src/quizz/Quizz.ts`
- `apps/front/src/quizz/loadQuestions.ts`

**Types clés** :

- `CarbonRange = [min,max] | number`
- `Question` (id, text, evolution, category, responses)
- `Answer` (id, text, children?, carbonImpact?)

**Moteur** :

- `handleAnswer` : ajoute un fragment au bloc courant
- `calcImpact` : somme récursive des impacts le long des enfants
- `calculateBlocEmission` : résultat final d’un bloc
- `normalizeCarbon` : moyenne si fourchette

**Stockage local** :

- `carbonBlocs_<category>` dans `localStorage`

### 5.4 Quizz UI

- `apps/front/src/pages/carbonEvaluation/Quizz.tsx`
    - root IDs : `Q1`, `T1`, `H1`, `C1`
- `apps/front/src/pages/carbonEvaluation/PreQuizz.tsx`
    - graphique des résultats (kg/semaine)

### 5.5 Scènes (Game)

- Entrée : `apps/front/src/scene/index.tsx`
- Base : `apps/front/src/scene/scenes/baseWorld.tsx`
- Scènes : `home`, `home2`, `ecogrid`, `trilogique`, `lightshadow`

## 6. Backend Auth (Go/Gin)

### 6.1 Entrée

`apps/auth/cmd/server/main.go`

### 6.2 Routes

`apps/auth/internal/routes/routes.go`

- Public : `/auths/register`, `/auths/login`, `/auths/token`, `/auths/jwt`
- JWT : `/auths/logout`, `/auths/password`, `/auths/username`, `/auths/`
- Interne API key : `/jwt/secretKeys`, `/jwt/secretKey`

### 6.3 Modèles

`apps/auth/internal/models/`

- `User`
- `RefreshToken`
- `JWTSecretKey`

### 6.4 DB

`apps/auth/internal/database/db.go`

- AutoMigrate : `User`, `RefreshToken`

## 7. Backend Core (Go/Gin)

### 7.1 Entrée

`apps/core/cmd/server/main.go`

### 7.2 Routes

`apps/core/internal/routes/routes.go`

- `/users/quizz/data`, `/users/quizz/history`, `/users/quizz/result`
- `/users/defi/daily`, `/users/defi/complete`
- `/users/profile`
- `/users/friends`, `/users/friends/requests`, etc.

### 7.3 Modèles

`apps/core/internal/models/`

- `Profile`
- `Friendship`
- `QuizzResult`
- `DefiDefinition`, `DailyDefi`

### 7.4 Chargement Quizz

`apps/core/internal/services/loader.go`

- Charge tous les JSON sous `internal/data`
- Construit une map `category -> questions`

## 8. Données Quizz

### 8.1 Format

Chaque JSON est un dictionnaire de `Question` :

- `id`, `text`, `evolution`, `responses`
- `responses[]` contient `children` et `carbonImpact`

### 8.2 Unité

Les valeurs `carbonImpact` sont **kgCO2e/semaine**. Le moteur additionne directement (pas de conversion).

## 9. Calcul d’empreinte

- Addition par branche
- Fourchettes cumulées
- Affichage en **kg/semaine** (moyenne si fourchette)

## 10. Sécurité

- JWT via `auth` (middleware côté core)
- API key interne

### 10.1 Stockage des mots de passe

- Hashage via **bcrypt** (`golang.org/x/crypto/bcrypt`).
- Utilisation de `bcrypt.DefaultCost`.
- Les mots de passe ne sont jamais stockés en clair.

### 10.2 JWT (durée de vie et rotation)

- Durée de vie du JWT : **42 minutes**.
- Les clés JWT sont **rotatées toutes les 15 minutes**.
- Clés stockées dans `data/secret_keys.json`.
- `kid` (Key ID) est utilisé dans le header JWT pour retrouver la clé active.

### 10.3 Refresh Tokens

- Durée de vie du refresh token : **7 jours**.
- Lors de la génération d’un token, tous les anciens tokens de l’utilisateur sont invalidés.
- Vérification systématique : token actif + non expiré.

### 10.4 Contrôle d’accès

- `core` : middleware JWT sur `/users/*`.
- `auth` : routes publiques pour login/register + routes JWT protégées.
- Endpoints internes `/jwt/*` protégés par API Key.

## 11. Dictionnaire de données (Postgres)

### 11.1 Auth (apps/auth)

**Table `users`** (modèle `User`) :

- `id` (PK)
- `username` (unique, not null)
- `email` (unique, not null)
- `password_hash` (not null)
- `is_active` (default true)
- `created_at`

**Table `refresh_tokens`** (modèle `RefreshToken`) :

- `id` (PK)
- `user_id` (FK -> users.id)
- `token` (unique)
- `expires_at`
- `is_active` (default true)
- `created_at`

### 11.2 Core (apps/core)

**Table `profiles`** (modèle `Profile`) :

- `user_id` (PK, FK -> users.id)
- `bio`
- `avatar_data` (bytea)
- `avatar_type` (varchar)
- `is_graph_public` (default false)
- `updated_at`

**Table `friendships`** (modèle `Friendship`) :

- `requester_id` (PK, FK -> users.id)
- `addressee_id` (PK, FK -> users.id)
- `status` (PENDING/ACCEPTED)
- `created_at`

**Table `quizz_results`** (modèle `QuizzResult`) :

- `id` (PK, gorm.Model)
- `user_id` (FK -> users.id)
- `category`
- `emission`
- `date`
- `created_at`, `updated_at`, `deleted_at` (gorm.Model)

**Table `daily_defis`** (modèle `DailyDefi`) :

- `id` (PK, gorm.Model)
- `user_id` (FK)
- `defi_id`
- `date_assigned`
- `status` (default PENDING)
- `reward_earned`
- `created_at`, `updated_at`, `deleted_at` (gorm.Model)

### 11.3 Notes GORM

- Les structs embarquant `gorm.Model` ajoutent :
    - `id`, `created_at`, `updated_at`, `deleted_at`

## 12. Checklist technique

- JSON quizz cohérents (enfants reliés)
- Ports configurés via `.env`
- Build front à refaire si JSON changent en mode Docker prod

## 13. Guide de maintenance (Logs & Backups)

### 13.1 Logs

Surveiller les logs en production :

```
docker compose logs -f core
docker compose logs -f auth
docker compose logs -f front
```

### 13.2 Sauvegarde Postgres

Exemple de backup complet :

```
docker exec -t gl26_ecohome-database-1 pg_dumpall -c -U postgres > dump.sql
```

## 14. Guide de contribution (Quizz)

### Ajouter une question

1. Modifier le JSON de la catégorie :
    - `apps/core/internal/data/alimentation.json`
    - `apps/core/internal/data/transport.json`
    - `apps/core/internal/data/logement.json`
    - `apps/core/internal/data/consommation.json`
2. Ajouter un nouvel objet Question avec un `id` unique.
3. Référencer cet `id` dans le champ `children` de la réponse parente.
4. Définir `carbonImpact` en **kgCO2e/semaine**.
5. Copier le JSON vers `apps/front/public/quizz/` et rebuild le front (Docker prod).

## 15. Checklist de mise en production

- Secrets `.env` (API_KEY, DB_PASSWORD) différents entre dev et prod
- Certificats SSL générés par certbot
- Rebuild du front si JSON quizz mis à jour

## 16. Tests et qualité

### Go (backend)

```
cd apps/core
go test ./...

cd ../auth
go test ./...
```

### Front (SolidJS)

Pas de suite de tests dédiée détectée. Utiliser le lint/build :

```
cd apps/front
npm run build
```

## 17. Performance

- Le calcul d’impact est **côté client** : cela réduit la charge serveur et évite des appels API à chaque réponse.

## 18. Commandes utiles

```
docker compose down

docker compose -f docker-compose.yml up -d --build

docker compose -f docker-compose.yml -f docker-compose-dev.yml up -d --build
```
