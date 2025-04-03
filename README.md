# Shai Calendar - Application de Planification de Réunions

Une application moderne de planification de réunions construite avec React, TypeScript et Supabase, avec intégration de Google Calendar.

## Fonctionnalités

- 📅 Gestion des types d'événements
- 🕒 Paramètres de disponibilité personnalisables
- 🤝 Planification de réunions
- 📱 Design responsive
- 🔒 Authentification et autorisation
- 🔄 Intégration Google Calendar
- 📨 Notifications par email
- 🌐 Pages de réservation publiques

## Stack Technique

### Frontend
- **React 18** : Bibliothèque UI moderne avec hooks et contextes
- **TypeScript** : Typage statique pour une meilleure maintenabilité
- **Vite** : Bundler rapide et moderne
- **TailwindCSS** : Framework CSS utilitaire
- **Radix UI** : Composants UI accessibles et personnalisables

### Backend & Services
- **Supabase** : 
  - Base de données PostgreSQL
  - Authentification
  - Row Level Security (RLS)
  - Edge Functions
- **Google Calendar API** : Intégration calendrier et visioconférence

### État & Données
- **Zustand** : Gestion d'état simple et performante
- **React Query** : Gestion du cache et des requêtes API
- **React Hook Form** : Gestion des formulaires avec validation

## Prérequis

- Node.js (v20 ou supérieur)
- npm (v9 ou supérieur)
- Git
- Compte Supabase
- Compte Google Cloud Platform (pour l'intégration Calendar)

## Installation

### 1. Cloner le Projet

Clonez le dépôt et accédez au répertoire du projet.

### 2. Installer les Dépendances

Exécutez la commande d'installation des dépendances.

### 3. Configuration de l'Environnement

1. Copiez le fichier d'environnement exemple
2. Configurez les variables d'environnement :
   - VITE_SUPABASE_URL : URL de votre projet Supabase
   - VITE_SUPABASE_ANON_KEY : Clé anonyme Supabase
   - VITE_APP_ORIGIN : URL de votre application

### 4. Configuration de Supabase

1. Créer un nouveau projet sur Supabase
2. Activer l'authentification par email
3. Exécuter les migrations depuis le dossier supabase/migrations
4. Configurer les politiques RLS

### 5. Lancer le Serveur de Développement

Lancez le serveur de développement pour démarrer l'application.

## Structure du Projet


├── src/
│   ├── components/     # Composants UI réutilisables
│   │   ├── ui/        # Composants UI de base
│   │   └── events/    # Composants liés aux événements
│   ├── hooks/         # Hooks React personnalisés
│   ├── layouts/       # Mises en page
│   ├── lib/          # Fonctions utilitaires
│   ├── pages/        # Composants de pages
│   │   ├── app/      # Pages de l'application
│   │   ├── auth/     # Pages d'authentification
│   │   └── external/ # Pages publiques
│   ├── providers/    # Providers React
│   ├── routes/       # Configuration des routes
│   ├── services/     # Services API
│   ├── store/        # Gestion d'état global
│   └── types/        # Définitions TypeScript
├── supabase/
│   ├── functions/    # Edge Functions
│   └── migrations/   # Migrations base de données
└── public/          # Assets statiques


## Scripts Disponibles

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Compile le projet pour la production
- `npm run preview` : Prévisualise la version de production
- `npm run lint` : Vérifie le code avec ESLint
- `npm run clean` : Nettoie les fichiers de build

## Déploiement

### Configuration Netlify

1. Connecter le dépôt à Netlify
2. Configurer les paramètres de build :
   - Commande de build : npm run build
   - Répertoire de publication : dist
3. Ajouter les variables d'environnement :
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_APP_ORIGIN

### Configuration Supabase

1. Créer un nouveau projet
2. Configurer l'authentification :
   - Activer l'authentification par email
   - Configurer les redirections OAuth
3. Exécuter les migrations
4. Vérifier les politiques RLS

## Intégration Google Calendar

### Configuration du Projet Google Cloud

1. Créer un projet sur Google Cloud Console
2. Activer l'API Google Calendar
3. Configurer les identifiants OAuth 2.0 :
   - Type : Application Web
   - Origines autorisées : URL de votre application
   - URI de redirection : URL de callback Supabase

### Configuration dans l'Application

1. Ajouter les identifiants dans les Edge Functions :
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - GOOGLE_REDIRECT_URI

2. Configurer les scopes OAuth pour l'accès au calendrier et aux événements

## Fonctionnalités Détaillées

### Gestion des Événements

1. Types d'événements :
   - Création de modèles d'événements
   - Configuration de la durée
   - Paramètres de confidentialité
   - Liens de partage personnalisés

2. Disponibilités :
   - Configuration par jour
   - Plages horaires personnalisables
   - Intervalles de temps configurables
   - Synchronisation avec Google Calendar

3. Réunions :
   - Réservation de créneaux
   - Confirmation automatique
   - Génération de liens de visioconférence
   - Notifications par email

### Sécurité

1. Authentification :
   - Inscription par email
   - Connexion sécurisée
   - Gestion des sessions
   - Protection des routes

2. Autorisation :
   - Politiques RLS Supabase
   - Vérification des tokens
   - Sécurisation des endpoints
   - Protection des données utilisateur

## Maintenance

### Base de Données

1. Migrations :
   - Création de nouvelles migrations
   - Application des migrations
   - Gestion des versions

2. Backup :
   - Sauvegardes automatiques Supabase
   - Export manuel possible

### Mises à Jour

1. Dépendances :
   - Vérification des mises à jour disponibles
   - Mise à jour des packages
   - Gestion des versions

2. Versions :
   - Suivre les changements de l'API Google
   - Maintenir les dépendances à jour
   - Tester les nouvelles versions

## Support

### Résolution des Problèmes

1. Logs :
   - Console navigateur
   - Logs Supabase
   - Logs Edge Functions

2. Erreurs Communes :
   - Problèmes d'authentification
   - Erreurs de synchronisation
   - Problèmes de permissions

### Ressources

1. Documentation :
   - React
   - Supabase
   - Google Calendar API

2. Support :
   - Issues GitHub
   - Support Supabase
   - Stack Overflow

## Contribution

1. Fork du projet
2. Créer une branche pour votre fonctionnalité
3. Commit des changements
4. Push vers la branche
5. Créer une Pull Request

