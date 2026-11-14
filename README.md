# CodeRoad

**CodeRoad** est un site web pour apprendre l'algorithmique : une roadmap par niveaux, un visualiseur qui anime les algorithmes pas à pas, et des exercices corrigés automatiquement.

Projet Web, SUP'COM, année universitaire 2025/2026 (Objectif 3 : développement et intégration des fonctionnalités principales).

## Choix du framework

| Couche | Choix | Pourquoi |
|---|---|---|
| Frontend | **Angular** (TypeScript) | Structure complète et imposée (routeur, formulaires, appels HTTP, gardes de route) : adaptée à un travail en groupe. Les *signaux* d'Angular rendent l'animation du visualiseur simple à piloter. |
| Backend | **Node.js + Express** | Même langage que le frontend, léger, très documenté. |
| Base de données | **MySQL** | Données relationnelles (utilisateurs, niveaux, exercices, tentatives) et statistiques calculées en SQL. |

## Fonctionnalités développées

6 pages, dont 5 dynamiques (données venant de l'API) :

| Page | Adresse | Accès | Contenu |
|---|---|---|---|
| Accueil | `/` | public | Présentation, accès rapides |
| Connexion / Inscription | `/login` | public | Formulaires avec validation, erreurs du serveur affichées |
| Roadmap | `/roadmap` | connecté | 5 niveaux avec progression ; un niveau se débloque quand le précédent est terminé |
| Visualiseur | `/visualizer` | public | Tri par sélection animé : lecture, pause, précédent/suivant, vitesse, pseudo-code synchronisé, tableau personnalisé |
| Exercices | `/exercises?level=N` | connecté | QCM, correction immédiate côté serveur avec explication, score final |
| Profil | `/profile` | connecté | Points, taux de réussite, progression par niveau, badges |

Autres éléments : thème sombre/clair mémorisé, notifications, menu en barre du bas sur mobile (responsive), jeton JWT, mots de passe hachés (bcrypt), requêtes SQL préparées.

## Prérequis

- **Node.js 22.22.3 ou plus récent** (ou 24.15+) : exigé par Angular 22. Vérifier avec `node -v`.
- **MySQL 8** (ou XAMPP/WAMP, qui l'inclut).
- Git.

## Lancement du projet

### 1. Base de données

```bash
cd backend
mysql -u root -p < schema.sql
```

Sous XAMPP sans mot de passe : `C:\xampp\mysql\bin\mysql.exe -u root < schema.sql`, ou importer `schema.sql` depuis phpMyAdmin.
Le script crée la base `coderoad`, les 4 tables et les données de départ (5 niveaux, 13 exercices).

### 2. Backend (API sur le port 3000)

```bash
cd backend
npm install
cp .env.example .env        # sous Windows : copy .env.example .env
```

Ouvrir `.env` et renseigner `DB_USER`, `DB_PASSWORD` et un `JWT_SECRET` (une longue phrase secrète). Puis :

```bash
npm start
```

Vérification : <http://localhost:3000/api/health> doit afficher `{"status":"ok"}`.

### 3. Frontend (site sur le port 4200)

Dans un second terminal :

```bash
cd frontend
npm install
npm start
```

Ouvrir <http://localhost:4200>. Le fichier `proxy.conf.json` redirige les appels `/api` vers le backend : pas de configuration supplémentaire.

## Structure du projet

```
coderoad/
├── backend/
│   ├── schema.sql                 tables + données de départ
│   ├── .env.example               modèle de configuration
│   └── src/
│       ├── server.js              point d'entrée
│       ├── db.js                  connexion MySQL (pool)
│       ├── middleware/auth.js     vérification du jeton JWT
│       ├── services/progress.js   calcul de la progression
│       └── routes/                auth, levels, exercises (+ attempts), me
└── frontend/
    ├── proxy.conf.json            redirection /api vers le backend
    └── src/app/
        ├── models/                interfaces TypeScript
        ├── services/              auth, api, notifier
        ├── interceptors/          ajoute le jeton aux requêtes
        ├── guards/                protège les pages privées
        ├── components/            header, footer, toast
        └── pages/                 home, login, roadmap, visualizer, exercises, profile
```

## API REST

| Méthode | Route | Accès | Rôle |
|---|---|---|---|
| POST | `/api/auth/register` | public | Créer un compte |
| POST | `/api/auth/login` | public | Se connecter, reçoit un jeton |
| GET | `/api/levels` | connecté | Niveaux, progression et statut |
| GET | `/api/exercises?level=N` | connecté | Questions d'un niveau (sans les réponses) |
| POST | `/api/attempts` | connecté | Envoyer une réponse, reçoit la correction |
| GET | `/api/me` | connecté | Profil, statistiques, badges |

## Tests effectués

- API : inscription, doublon, connexion, accès sans jeton, niveau verrouillé, correction, statistiques.
- Parcours complet dans un navigateur automatisé : garde de route, validation des formulaires, exercices, déblocage de niveau, visualiseur, profil, thème, déconnexion (30 vérifications).
- Algorithme du tri : 2000 tableaux aléatoires, résultat toujours correctement trié.
- Mobile (390 px) : aucun défilement horizontal.

À faire à la main avant le rendu : vérifier l'affichage dans Firefox, Edge et Safari.

## Limites connues

- Un seul algorithme est animé (le tri par sélection) ; la structure permet d'en ajouter d'autres.
- Les exercices sont uniquement des QCM.
- Pas de récupération de mot de passe oublié.
